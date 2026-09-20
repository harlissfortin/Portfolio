"""
Green Belt practicum — case dataset generator.

Run from anywhere:  python3 generate.py
Writes the CSVs next to this file. Fixed seed; re-running reproduces the files exactly.

Three verticals, one dataset family each, used in weeks 2–8 of the Green Belt calendar:
  MFG  mfg-bracket-line.csv     ~1,500 drilled brackets (hole-position deviation, pass/fail, rework)
       mfg-gage-rr.csv          10 parts x 3 operators x 2 trials, hand-held gauge (fails on purpose)
       mfg-gage-rr-after.csv    same parts, standardized method (passes) — released by the instructor
       mfg-pilot.csv            2 weeks after the fixture countermeasure — released by the instructor
  HC   hc-discharge.csv         ~1,200 discharges (order time, actual time, pharmacy and transport)
       hc-attribute-agreement.csv  50 records x 3 raters x 2 trials, "discharge ready" yes/no
       hc-pilot.csv             3 weeks after the pharmacy countermeasure on unit 4E — instructor-released
  TXN  txn-invoices.csv         ~2,000 invoices (channel, clerk, vendor group, entry time, corrections)
       txn-pilot.csv            3 weeks after the Email-PDF intake countermeasure — instructor-released

What is planted in each file is listed in the case files (case-mfg.md, case-hc.md, case-txn.md),
FACILITATOR ANSWER KEY sections. Do not hand this script or those sections to learners.
"""
from pathlib import Path

import numpy as np
import pandas as pd

SEED = 20260920
HERE = Path(__file__).resolve().parent
rng = np.random.default_rng(SEED)


def working_days(start, weeks):
    days = pd.bdate_range(start, periods=weeks * 5)
    return list(days)


def hhmm(minutes):
    minutes = int(round(minutes))
    minutes = max(0, min(minutes, 23 * 60 + 59))
    return f"{minutes // 60:02d}:{minutes % 60:02d}"


# --------------------------------------------------------------------------------------
# MFG — bracket line B, hole-position deviation (mm from nominal, tolerance ±0.25 mm)
# --------------------------------------------------------------------------------------
MFG_PART_SD = 0.09          # true part-to-part sd, common cause
MFG_MEAS_SD = 0.037         # hand-held gauge: repeatability + operator differences
MFG_F3_SHIFT = 0.12         # fixture F3 mean shift (worn locating pin)
MFG_NIGHT_MULT = 1.6        # night-shift sd multiplier (coolant temperature drift, no warm-up cycle)
MFG_TOOL_EVENT = 0.15       # two-day special cause on machine M2 (tool change without offset reset)
MFG_TOL = 0.25

SHIFT_OPS = {"Day": ["OP-11", "OP-12", "OP-13"],
             "Swing": ["OP-21", "OP-22", "OP-23"],
             "Night": ["OP-31", "OP-32", "OP-33"]}
MACHINE_FIXTURES = {"M1": ["F1", "F2"], "M2": ["F3", "F4"]}


def mfg_true_deviation(n, fixture, shift, machine, day_index):
    sd = MFG_PART_SD * np.where(shift == "Night", MFG_NIGHT_MULT, 1.0)
    mean = np.where(fixture == "F3", MFG_F3_SHIFT, 0.0)
    mean = mean + np.where((machine == "M2") & np.isin(day_index, [30, 31]), MFG_TOOL_EVENT, 0.0)
    return rng.normal(mean, sd, size=n)


def mfg_rows(days, day_offset=0, meas_sd=MFG_MEAS_SD, f3_shift=MFG_F3_SHIFT, tool_event=True):
    rows = []
    pid = 0
    for i, d in enumerate(days):
        di = i + day_offset
        for shift in ["Day", "Swing", "Night"]:
            n = 10
            machine = rng.choice(["M1", "M2"], size=n)
            fixture = np.array([rng.choice(MACHINE_FIXTURES[m]) for m in machine])
            operator = rng.choice(SHIFT_OPS[shift], size=n)
            sd = MFG_PART_SD * (MFG_NIGHT_MULT if shift == "Night" else 1.0)
            mean = np.where(fixture == "F3", f3_shift, 0.0)
            if tool_event:
                mean = mean + np.where((machine == "M2") & (di in (30, 31)), MFG_TOOL_EVENT, 0.0)
            true = rng.normal(mean, sd, size=n)
            measured = np.round(true + rng.normal(0, meas_sd, size=n), 2)
            for k in range(n):
                pid += 1
                rows.append({
                    "date": d.date().isoformat(),
                    "shift": shift,
                    "machine": machine[k],
                    "fixture": fixture[k],
                    "operator_id": operator[k],
                    "hole_pos_dev_mm": measured[k],
                })
    df = pd.DataFrame(rows)
    df.insert(0, "part_id", [f"B{day_offset * 30 + j + 1:05d}" for j in range(len(df))])
    df["result"] = np.where(df["hole_pos_dev_mm"].abs() <= MFG_TOL, "pass", "fail")
    rework = np.round(rng.lognormal(np.log(20), 0.35, size=len(df))).astype(int)
    df["rework_min"] = np.where(df["result"] == "fail", rework, np.nan)
    return df


def make_mfg():
    days = working_days("2026-03-02", 10)                     # 50 working days x 30 parts = 1,500
    df = mfg_rows(days)

    # mess: five unrecorded measurements (inspector logged pass without a number) ...
    blanks = rng.choice(df.index, size=5, replace=False)
    df.loc[blanks, "hole_pos_dev_mm"] = np.nan
    df.loc[blanks, "result"] = "pass"
    df.loc[blanks, "rework_min"] = np.nan
    # ... and one impossible value: 12.50 mm recorded as a pass (keyed in hundredths; true ~0.125)
    imp = df.index[(df["fixture"] == "F1") & (df["shift"] == "Day")][97]
    df.loc[imp, "hole_pos_dev_mm"] = 12.50
    df.loc[imp, "result"] = "pass"
    df.loc[imp, "rework_min"] = np.nan
    df["rework_min"] = df["rework_min"].astype("Int64")
    df.to_csv(HERE / "mfg-bracket-line.csv", index=False)

    # Gage R&R subset: 10 parts spanning the process, 3 operators (one per shift), 2 trials
    parts_true = np.array([-0.17, -0.11, -0.07, -0.04, -0.01, 0.02, 0.05, 0.09, 0.13, 0.18])
    ops = ["OP-12", "OP-22", "OP-32"]

    def grr(bias, rep_sd, fname):
        rows = []
        for trial in (1, 2):
            for o, b in zip(ops, bias):
                for p, t in enumerate(parts_true, start=1):
                    rows.append({"part": f"P{p:02d}", "operator": o, "trial": trial,
                                 "measurement_mm": round(t + b + rng.normal(0, rep_sd), 3)})
        g = pd.DataFrame(rows).sort_values(["part", "operator", "trial"]).reset_index(drop=True)
        g.to_csv(HERE / fname, index=False)
        return g

    grr(bias=[0.0, 0.035, -0.025], rep_sd=0.030, fname="mfg-gage-rr.csv")          # fails (~35% SV)
    grr(bias=[0.0, 0.006, -0.004], rep_sd=0.011, fname="mfg-gage-rr-after.csv")    # standardized method

    # Pilot: 2 weeks after F3 locating pin replaced and clamp-torque check added to changeover.
    # Measured with the SAME hand-held gauge and method as the baseline (like for like).
    pdays = working_days("2026-06-01", 2)
    pilot = mfg_rows(pdays, day_offset=1000, f3_shift=0.01, tool_event=False)
    pilot["part_id"] = [f"B{30000 + j + 1:05d}" for j in range(len(pilot))]
    pilot["rework_min"] = pilot["rework_min"].astype("Int64")
    pilot.to_csv(HERE / "mfg-pilot.csv", index=False)
    return df


# --------------------------------------------------------------------------------------
# HC — discharge: order written -> patient leaves the unit
# --------------------------------------------------------------------------------------
UNITS = {"3W": 0.30, "4E": 0.25, "5N": 0.20, "6S": 0.25}      # medicine, surgery, ortho, telemetry
MEDS_ON_PATH = {"3W": 0.15, "4E": 1.0, "5N": 0.15, "6S": 1.0}  # share of pharmacy TAT on the critical path
TAT_MEAN = {"3W": 55, "4E": 105, "5N": 55, "6S": 105}
TAT_SD = {"3W": 20, "4E": 40, "5N": 20, "6S": 40}
HC_BASE = 55
HC_MONDAY = 40
HC_NOISE = 25
WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]


def gamma(mean, sd, size):
    shape = (mean / sd) ** 2
    scale = sd ** 2 / mean
    return rng.gamma(shape, scale, size=size)


def hc_rows(dates, id_start, tat_override=None):
    rows = []
    did = id_start
    for d in dates:
        wd = d.weekday()
        n = rng.poisson(12.5 if wd < 5 else 6.5)
        for _ in range(n):
            unit = rng.choice(list(UNITS), p=list(UNITS.values()))
            order = np.clip(rng.normal(11 * 60, 95), 7 * 60, 16 * 60)
            tat_mean = TAT_MEAN[unit]
            tat_sd = TAT_SD[unit]
            if tat_override and unit in tat_override:
                tat_mean, tat_sd = tat_override[unit]
            tat = float(gamma(tat_mean, tat_sd, 1)[0])
            has_meds = rng.random() > 0.04
            transport = float(gamma(25, 18, 1)[0])
            delay = (HC_BASE + (MEDS_ON_PATH[unit] * tat if has_meds else 0.0) + transport
                     + (HC_MONDAY if wd == 0 else 0.0) + rng.normal(0, HC_NOISE))
            delay = float(np.clip(delay, 20, 600))
            did += 1
            rows.append({
                "discharge_id": f"D{did:05d}",
                "date": d.date().isoformat(),
                "unit": unit,
                "weekday": WEEKDAY_NAMES[wd],
                "order_time": hhmm(order),
                "actual_discharge_time": hhmm(order + delay),
                "pharmacy_turnaround_min": int(round(tat)) if has_meds else np.nan,
                "transport_wait_min": int(round(transport)),
            })
    df = pd.DataFrame(rows)
    df["pharmacy_turnaround_min"] = df["pharmacy_turnaround_min"].astype("Int64")
    return df, did


def make_hc():
    dates = list(pd.date_range("2026-01-05", "2026-04-26", freq="D"))   # 16 weeks
    df, last = hc_rows(dates, 0)
    # mess: two records where the actual time was keyed before the order time (transposed hour)
    bad = rng.choice(df.index, size=2, replace=False)
    for b in bad:
        h, m = map(int, df.loc[b, "order_time"].split(":"))
        df.loc[b, "actual_discharge_time"] = hhmm(h * 60 + m - 95)
    df.to_csv(HERE / "hc-discharge.csv", index=False)

    # Attribute agreement: 50 charts, "discharge ready" yes/no, 3 raters x 2 blind trials,
    # consensus standard from a two-physician panel.
    standard = np.array(["yes"] * 30 + ["no"] * 20)
    rng.shuffle(standard)
    # (false "no" rate when standard is yes, false "yes" rate when standard is no)
    raters = {"R1": (0.08, 0.08), "R2": (0.14, 0.12), "R3": (0.30, 0.10)}
    aa = pd.DataFrame({"record_id": [f"C{i + 1:03d}" for i in range(50)], "standard": standard})
    for r, (fn, fp) in raters.items():
        for t in (1, 2):
            flip = np.where(standard == "yes", rng.random(50) < fn, rng.random(50) < fp)
            aa[f"{r}_trial{t}"] = np.where(flip, np.where(standard == "yes", "no", "yes"), standard)
    aa.to_csv(HERE / "hc-attribute-agreement.csv", index=False)

    # Pilot: 3 weeks after "meds prepared at order" on 4E (TAT falls to ~55/20); 6S unchanged as a
    # comparison unit. All units included.
    pdates = list(pd.date_range("2026-06-01", "2026-06-21", freq="D"))
    pilot, _ = hc_rows(pdates, 20000, tat_override={"4E": (55, 20)})
    pilot.to_csv(HERE / "hc-pilot.csv", index=False)
    return df


# --------------------------------------------------------------------------------------
# TXN — accounts payable invoice entry
# --------------------------------------------------------------------------------------
CHANNELS = {"Portal": 0.35, "Email-PDF": 0.30, "Paper-scan": 0.15, "EDI": 0.20}
CH_MIN = {"Portal": 5.0, "Email-PDF": 7.5, "Paper-scan": 9.0, "EDI": 2.0}
CH_CORR = {"Portal": 0.045, "Email-PDF": 0.15, "Paper-scan": 0.06, "EDI": 0.02}
VENDORS = {"Raw materials": 0.35, "MRO": 0.25, "Services": 0.20, "Freight": 0.12, "Utilities": 0.08}
VG_MIN = {"Raw materials": 0.0, "MRO": 0.0, "Services": 3.0, "Freight": 1.0, "Utilities": 0.0}
VG_PAY = {"Raw materials": 28, "MRO": 30, "Services": 37, "Freight": 26, "Utilities": 22}
CLERKS = [f"C{i:02d}" for i in range(1, 13)]
CHANGE_DATE = pd.Timestamp("2026-04-06")       # OCR template and field-order change
EXTRACT_DATE = pd.Timestamp("2026-07-10")


def txn_rows(days, id_start, corr_override=None, drift=True):
    rows = []
    iid = id_start
    end = days[-1]
    for d in days:
        n = rng.poisson(15.4)
        for _ in range(n):
            ch = rng.choice(list(CHANNELS), p=list(CHANNELS.values()))
            vg = rng.choice(list(VENDORS), p=list(VENDORS.values()))
            clerk = rng.choice(CLERKS)
            base = CH_MIN[ch] + VG_MIN[vg]
            factor = 1.0
            if drift and ch != "EDI" and d >= CHANGE_DATE:
                frac = (d - CHANGE_DATE).days / max(1, (end - CHANGE_DATE).days)
                factor = 0.92 - 0.14 * frac                      # step, then continued drift down
            minutes = base * factor * rng.lognormal(0, 0.30)
            p = CH_CORR[ch]
            if corr_override and ch in corr_override:
                p = corr_override[ch]
            corrected = rng.random() < p
            pay = VG_PAY[vg] + (6 if corrected else 0) + rng.normal(0, 5)
            pay = max(3, int(round(pay)))
            iid += 1
            rows.append({
                "invoice_id": f"INV{iid:06d}",
                "date": d.date().isoformat(),
                "entry_channel": ch,
                "clerk_code": clerk,
                "vendor_group": vg,
                "entry_minutes": round(minutes, 1),
                "corrected": "Yes" if corrected else "No",
                "days_to_pay": pay,
            })
    df = pd.DataFrame(rows)
    return df, iid


def make_txn():
    days = working_days("2026-01-05", 26)      # 130 working days
    df, last = txn_rows(days, 100000)
    # censoring: not yet paid at extract date
    age = (EXTRACT_DATE - pd.to_datetime(df["date"])).dt.days
    df.loc[df["days_to_pay"] > age, "days_to_pay"] = np.nan
    # mess: six blank entry times (timer not started), eight non-standard yes/no spellings,
    # one negative days-to-pay (payment date keyed before invoice date), one duplicated invoice row
    blanks = rng.choice(df.index, size=6, replace=False)
    df.loc[blanks, "entry_minutes"] = np.nan
    odd = rng.choice(df.index, size=8, replace=False)
    df.loc[odd, "corrected"] = [{"Yes": v, "No": w}[c] for c, v, w in
                                zip(df.loc[odd, "corrected"], ["Y", "yes", "YES", "y"] * 2,
                                    ["N", "no", "NO", "n"] * 2)]
    neg = df.index[(df["vendor_group"] == "Utilities") & df["days_to_pay"].notna()][40]
    df.loc[neg, "days_to_pay"] = -12
    dup = df.index[df["entry_channel"] == "Paper-scan"][123]
    df = pd.concat([df.iloc[:dup + 1], df.iloc[[dup]], df.iloc[dup + 1:]]).reset_index(drop=True)
    df["days_to_pay"] = df["days_to_pay"].astype("Int64")
    df.to_csv(HERE / "txn-invoices.csv", index=False)

    # Pilot: 3 weeks after Email-PDF intake moved to a structured upload form with required fields.
    pdays = working_days("2026-08-03", 3)
    pilot, _ = txn_rows(pdays, 200000, corr_override={"Email-PDF": 0.055}, drift=False)
    # entry minutes at the post-drift level
    pilot.loc[pilot["entry_channel"] != "EDI", "entry_minutes"] = \
        (pilot.loc[pilot["entry_channel"] != "EDI", "entry_minutes"] * 0.78).round(1)
    pilot["days_to_pay"] = pd.array([pd.NA] * len(pilot), dtype="Int64")   # nothing paid yet
    pilot.to_csv(HERE / "txn-pilot.csv", index=False)
    return df


if __name__ == "__main__":
    m = make_mfg()
    h = make_hc()
    t = make_txn()
    for f in sorted(HERE.glob("*.csv")):
        print(f"{f.name:32s} {len(pd.read_csv(f)):6d} rows  {f.stat().st_size / 1024:6.1f} KB")
