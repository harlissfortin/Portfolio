"""
Black Belt DOE practicum — reference dataset generator.

Run from anywhere:  python3 generate.py            (writes the two CSVs next to this file)
                    python3 generate.py --key      (also prints the facilitator answer key)

Fixed seed; re-running reproduces the files exactly. Both files are the pre-immersion
exercise for week 9–10 and the facilitator's calibration reference for Immersion 1
(see ../doe-practicum.md, "Pre-work" and "Facilitator answer key").

  helicopter-2k.csv    2^4 full factorial on the paper-helicopter kit, 2 replicates (32 runs)
                       plus 4 center points; response = flight time in seconds from a 2.5 m
                       drop (mean of two stopwatches). Planted: two real main effects (wing
                       length, clip count), one real interaction (wing length x clip count),
                       curvature (the center points fly longer than the plane predicts).
                       Body width and paper weight are inert.

  simulator-runs.csv   2^(5-1) half fraction on the transactional process simulator, 16 runs,
                       built with the simulator's default generator E = ABC (resolution IV,
                       I = ABCE). Planted: real effects on batch size, validation point,
                       routing rule and staffing; a real routing x staffing interaction (C*E)
                       that the design aliases with batch size x validation point (A*B).
                       Template (D) is inert. The response is generated from the simulator's
                       planted response structure plus run-to-run noise, not from the live
                       queueing model, so the numbers are reproducible for the answer key.

Do not hand this script or the --key output to candidates.
"""
import sys
from itertools import product
from pathlib import Path

import numpy as np
import pandas as pd

SEED = 20260920
HERE = Path(__file__).resolve().parent
# One stream per file so a change to one dataset never alters the other. The offsets were
# chosen once so that the planted structure reads cleanly against the noise (inert terms
# inside Lenth's margin, planted terms outside it); they are not tuned run by run.
rng_h = np.random.default_rng(SEED + 11)
rng_s = np.random.default_rng(SEED + 1044)


# --------------------------------------------------------------------------------------
# Helicopter: 2^4 with 2 replicates + 4 center points
# --------------------------------------------------------------------------------------
HELI_FACTORS = {
    #  name               low   high  center  unit
    "wing_length_mm": (70, 110, 90),
    "body_width_mm": (25, 45, 35),
    "paper_gsm": (80, 120, 100),
    "clips": (1, 3, 2),
}
HELI_MEAN = 2.05          # s, grand mean of the factorial points
HELI_COEF = {             # regression coefficients on coded (-1/+1) factors; effect = 2 x coef
    "A": 0.30,            # wing length: longer wings fly longer (effect +0.60 s)
    "B": 0.00,            # body width: inert
    "C": 0.00,            # paper weight: inert
    "D": -0.25,           # clips: more mass, faster descent (effect -0.50 s)
    "AD": 0.12,           # wing length x clips (effect +0.24 s): long wings lose less to mass
}
HELI_CURVATURE = 0.30     # s, center points fly longer than the plane predicts
HELI_NOISE_SD = 0.12      # s, drop-to-drop noise incl. two-timer averaging


def helicopter():
    rows = []
    std = 0
    for rep in (1, 2):
        for d, c, b, a in product((-1, 1), repeat=4):   # Yates order: A alternates fastest
            std += 1
            rows.append(dict(std_order=std if rep == 1 else std - 16, replicate=rep,
                             point_type="factorial", A=a, B=b, C=c, D=d))
    for k in range(4):
        rows.append(dict(std_order=17 + k, replicate=k + 1, point_type="center",
                         A=0, B=0, C=0, D=0))
    df = pd.DataFrame(rows)

    y = (HELI_MEAN + HELI_COEF["A"] * df.A + HELI_COEF["B"] * df.B + HELI_COEF["C"] * df.C
         + HELI_COEF["D"] * df.D + HELI_COEF["AD"] * df.A * df.D
         + np.where(df.point_type == "center", HELI_CURVATURE, 0.0)
         + rng_h.normal(0, HELI_NOISE_SD, len(df)))
    # two stopwatches: each timer reads the true flight with its own reaction noise
    t1 = y + rng_h.normal(0.0, 0.06, len(df))
    t2 = y + rng_h.normal(0.02, 0.06, len(df))
    df["timer_1_s"] = t1.round(2)
    df["timer_2_s"] = t2.round(2)
    df["flight_time_s"] = ((df.timer_1_s + df.timer_2_s) / 2).round(3)

    for col, (lo, hi, mid) in HELI_FACTORS.items():
        code = {"wing_length_mm": "A", "body_width_mm": "B", "paper_gsm": "C", "clips": "D"}[col]
        df[col] = np.select([df[code] == -1, df[code] == 1], [lo, hi], mid)

    order = rng_h.permutation(len(df)) + 1
    df["run_order"] = order
    df = df.sort_values("run_order").reset_index(drop=True)
    cols = ["run_order", "std_order", "replicate", "point_type",
            "wing_length_mm", "body_width_mm", "paper_gsm", "clips",
            "A", "B", "C", "D", "timer_1_s", "timer_2_s", "flight_time_s"]
    return df[cols]


# --------------------------------------------------------------------------------------
# Simulator: 2^(5-1), generator E = ABC (resolution IV, I = ABCE)
# --------------------------------------------------------------------------------------
SIM_LEVELS = {
    "batch_size": (1, 20),                        # A  invoices per batch
    "validation_point": ("approval", "entry"),    # B
    "routing": ("manual", "rule-based"),          # C
    "template": ("current", "redesigned"),        # D
    "staffing_clerks": (3, 5),                    # E
}
SIM_MEAN = 30.0           # working hours, mean invoice cycle time over a simulated week
SIM_COEF = {              # coefficients on coded factors; effect = 2 x coef
    "A": 3.00,            # batching adds cycle time (effect +6.0 h)
    "B": -2.00,           # validation at entry (effect -4.0 h)
    "C": -1.50,           # rule-based routing (effect -3.0 h)
    "D": 0.00,            # template: inert
    "E": -1.25,           # five clerks vs three (effect -2.5 h)
    "AB": 0.00,           # planted zero: the column will still read ~ +1.8 because of C*E
    "CE": 0.90,           # routing helps less when staffing is generous (effect +1.8 h)
}
SIM_NOISE_SD = 0.80       # h, week-to-week simulator noise


def simulator():
    rows = []
    std = 0
    for d, c, b, a in product((-1, 1), repeat=4):
        std += 1
        rows.append(dict(std_order=std, A=a, B=b, C=c, D=d, E=a * b * c))
    df = pd.DataFrame(rows)
    y = (SIM_MEAN + sum(SIM_COEF[k] * df[k] for k in "ABCDE")
         + SIM_COEF["AB"] * df.A * df.B + SIM_COEF["CE"] * df.C * df.E
         + rng_s.normal(0, SIM_NOISE_SD, len(df)))
    df["cycle_time_h"] = y.round(2)
    df["seed"] = rng_s.integers(10_000, 99_999, len(df))
    for col, (lo, hi) in SIM_LEVELS.items():
        code = {"batch_size": "A", "validation_point": "B", "routing": "C",
                "template": "D", "staffing_clerks": "E"}[col]
        df[col] = np.where(df[code] == -1, lo, hi)
    df["run_order"] = rng_s.permutation(16) + 1
    df = df.sort_values("run_order").reset_index(drop=True)
    cols = ["run_order", "std_order", "batch_size", "validation_point", "routing",
            "template", "staffing_clerks", "A", "B", "C", "D", "E", "seed", "cycle_time_h"]
    return df[cols]


# --------------------------------------------------------------------------------------
# Answer key (facilitator only)
# --------------------------------------------------------------------------------------
def effects_table(df, y, factors, terms):
    """Effect = mean(high) - mean(low) on the product column; returns a DataFrame."""
    out = []
    for t in terms:
        col = np.prod([df[f] for f in t], axis=0)
        eff = df.loc[col == 1, y].mean() - df.loc[col == -1, y].mean()
        out.append((t, eff))
    return pd.DataFrame(out, columns=["term", "effect"])


def lenth(effects):
    e = np.abs(np.asarray(effects))
    s0 = 1.5 * np.median(e)
    pse = 1.5 * np.median(e[e < 2.5 * s0])
    d = len(e)
    from math import sqrt
    # t quantile without scipy: use a small table for d/3 df
    tq = {5: 2.571, 4: 2.776, 3: 3.182, 6: 2.447, 7: 2.365, 8: 2.306, 10: 2.228}
    df_ = max(1, round(d / 3))
    t = tq.get(df_, 2.571)
    return s0, pse, t * pse, df_


def key_helicopter(df):
    fac = df[df.point_type == "factorial"]
    ctr = df[df.point_type == "center"]
    terms = ["A", "B", "C", "D", "AB", "AC", "AD", "BC", "BD", "CD",
             "ABC", "ABD", "ACD", "BCD", "ABCD"]
    eff = effects_table(fac, "flight_time_s", "ABCD", terms)
    n = len(fac)
    # pure error from replicates (16 cells x 2)
    cells = fac.groupby(["A", "B", "C", "D"]).flight_time_s
    ss_pe = ((fac.flight_time_s - cells.transform("mean")) ** 2).sum()
    df_pe = n - 16
    # center points add pure error too
    ss_pe_c = ((ctr.flight_time_s - ctr.flight_time_s.mean()) ** 2).sum()
    df_pe_c = len(ctr) - 1
    ms_pe = (ss_pe + ss_pe_c) / (df_pe + df_pe_c)
    se_eff = 2 * np.sqrt(ms_pe / n)
    eff["SS"] = n * eff.effect ** 2 / 4
    eff["F"] = eff.SS / ms_pe
    eff["t"] = eff.effect / se_eff
    yF, yC = fac.flight_time_s.mean(), ctr.flight_time_s.mean()
    nF, nC = len(fac), len(ctr)
    ss_curv = nF * nC * (yF - yC) ** 2 / (nF + nC)
    print("\n=== helicopter-2k.csv — answer key ===")
    print(f"N factorial = {nF}, center points = {nC}")
    print(f"grand mean factorial = {yF:.3f} s, center mean = {yC:.3f} s, "
          f"curvature (yC - yF) = {yC - yF:+.3f} s")
    print(f"pure error: SS = {ss_pe + ss_pe_c:.4f} on {df_pe + df_pe_c} df, "
          f"MS = {ms_pe:.5f}, s = {np.sqrt(ms_pe):.4f} s")
    print(f"SE(effect) = 2*s/sqrt(N) = {se_eff:.4f} s ; SE(coef) = {se_eff / 2:.4f}")
    print(f"curvature: SS = {ss_curv:.4f}, F = {ss_curv / ms_pe:.1f} on 1, "
          f"{df_pe + df_pe_c} df")
    with pd.option_context("display.float_format", "{:.4f}".format):
        print(eff.to_string(index=False))
    # cell means for the A x D interaction plot
    print("\nA x D cell means (s):")
    print(fac.pivot_table(index="A", columns="D", values="flight_time_s", aggfunc="mean")
          .round(3).to_string())
    print("\nA x D natural-unit cell means (wing length mm x clips):")
    print(fac.pivot_table(index="wing_length_mm", columns="clips", values="flight_time_s",
                          aggfunc="mean").round(3).to_string())
    # two-timer agreement
    d = df.timer_1_s - df.timer_2_s
    print(f"\ntwo-timer check: mean difference (t1 - t2) = {d.mean():+.3f} s, "
          f"SD of differences = {d.std(ddof=1):.3f} s (n = {len(d)})")


def key_simulator(df):
    terms = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "AE", "BC", "BD", "BE", "CD",
             "CE", "DE"]
    eff = effects_table(df, "cycle_time_h", "ABCDE", terms)
    # in this design the 15 columns are not independent: AB = CE, AC = BE, BC = AE
    # and D-interactions alias with 3-factor terms; keep the 15 orthogonal columns
    cols = ["A", "B", "C", "D", "E", "AB", "AC", "AD", "BC", "BD", "CD", "DE",
            "ABD", "ACD", "BCD"]
    eff15 = effects_table(df, "cycle_time_h", "ABCDE", cols)
    s0, pse, me, dfl = lenth(eff15.effect)
    print("\n=== simulator-runs.csv — answer key ===")
    print("design: 2^(5-1), E = ABC, I = ABCE, resolution IV")
    print("aliases: A=BCE  B=ACE  C=ABE  E=ABC  D=ABCDE  AB=CE  AC=BE  BC=AE  "
          "AD=BCDE  BD=ACDE  CD=ABDE  DE=ABCD")
    print(f"grand mean = {df.cycle_time_h.mean():.3f} h")
    with pd.option_context("display.float_format", "{:.3f}".format):
        print(eff15.sort_values("effect", key=np.abs, ascending=False).to_string(index=False))
    print(f"Lenth: s0 = {s0:.3f}, PSE = {pse:.3f}, ME = t(0.025,{dfl}) x PSE = {me:.3f}")
    print("active (|effect| > ME):",
          ", ".join(eff15.loc[eff15.effect.abs() > me, "term"]))
    print("note: the CE column is identical to the AB column in this design; "
          f"AB(=CE) column reads {eff.loc[eff.term == 'AB', 'effect'].item():+.3f}")
    # predictions
    def pred(a, b, c, e, d=0):
        return (SIM_MEAN + SIM_COEF['A'] * a + SIM_COEF['B'] * b + SIM_COEF['C'] * c
                + SIM_COEF['E'] * e + SIM_COEF['CE'] * c * e)
    print(f"true model: today (batch 20, approval, manual, 3 clerks) = "
          f"{pred(1, -1, -1, -1):.1f} h; best (1, entry, rule-based, 5 clerks) = "
          f"{pred(-1, 1, 1, 1):.1f} h; (1, entry, rule-based, 3 clerks) = "
          f"{pred(-1, 1, 1, -1):.1f} h; (1, entry, manual, 5 clerks) = {pred(-1, 1, -1, 1):.1f} h")


if __name__ == "__main__":
    heli = helicopter()
    sim = simulator()
    heli.to_csv(HERE / "helicopter-2k.csv", index=False)
    sim.to_csv(HERE / "simulator-runs.csv", index=False)
    print(f"wrote helicopter-2k.csv ({len(heli)} rows) and simulator-runs.csv ({len(sim)} rows)")
    if "--key" in sys.argv:
        key_helicopter(heli)
        key_simulator(sim)
