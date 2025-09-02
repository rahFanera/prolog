import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  User,
  Gavel,
  BookOpen,
} from "lucide-react";

const CRIMES = ["assassinat", "vol", "escroquerie"];
const SUSPECTS = ["john", "mary", "alice", "bruno", "sophie"];

const DEFAULT_FACTS = {
  has_motive: {
    john: new Set(["vol"]),
    mary: new Set(["assassinat"]),
    alice: new Set(["escroquerie"]),
    bruno: new Set(["escroquerie"]),
    sophie: new Set(["escroquerie"]),
  },
  was_near_crime_scene: {
    john: new Set(["vol"]),
    mary: new Set(["assassinat"]),
    alice: new Set(),
    bruno: new Set(),
    sophie: new Set(),
  },
  has_fingerprint_on_weapon: {
    john: new Set(["vol"]),
    mary: new Set(["assassinat"]),
    alice: new Set(),
    bruno: new Set(),
    sophie: new Set(),
  },
  has_bank_transaction: {
    john: new Set(),
    mary: new Set(),
    alice: new Set(["escroquerie"]),
    bruno: new Set(["escroquerie"]),
    sophie: new Set(),
  },
  owns_fake_identity: {
    john: new Set(),
    mary: new Set(),
    alice: new Set(),
    bruno: new Set(),
    sophie: new Set(["escroquerie"]),
  },
};

function cloneFacts(facts) {
  const out = {};
  for (const pred of Object.keys(facts)) {
    out[pred] = {};
    for (const s of SUSPECTS) out[pred][s] = new Set(facts[pred][s]);
  }
  return out;
}

function isGuilty(facts, suspect, crime) {
  const H = (pred) => facts[pred]?.[suspect]?.has(crime) ?? false;

  if (crime === "vol" || crime === "assassinat") {
    const conds = [
      { pred: "has_motive", ok: H("has_motive") },
      { pred: "was_near_crime_scene", ok: H("was_near_crime_scene") },
      { pred: "has_fingerprint_on_weapon", ok: H("has_fingerprint_on_weapon") },
    ];
    const guilty = conds.every((c) => c.ok);
    return { guilty, conds, anyOf: [] };
  }

  if (crime === "escroquerie") {
    const conds = [{ pred: "has_motive", ok: H("has_motive") }];
    const anyOf = [
      { pred: "has_bank_transaction", ok: H("has_bank_transaction") },
      { pred: "owns_fake_identity", ok: H("owns_fake_identity") },
    ];
    const guilty = conds.every((c) => c.ok) && anyOf.some((a) => a.ok);
    return { guilty, conds, anyOf };
  }
  return { guilty: false, conds: [], anyOf: [] };
}

const Section = ({ title, icon, children }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg shadow-gray-200/40">
    <div className="flex items-center gap-3 mb-4 text-gray-700">
      {icon}
      <h3 className="text-xs font-semibold tracking-wide uppercase">{title}</h3>
    </div>
    {children}
  </div>
);

const Chip = ({ selected, onClick, children }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border shadow-sm ${
      selected
        ? "bg-stone-900 text-white border-stone-900"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </motion.button>
);

const FactToggle = ({ label, checked, onChange }) => (
  <motion.label
    whileHover={{ scale: 1.01 }}
    className="flex items-start gap-3 px-3 py-2 rounded-xl border bg-white shadow-sm transition-colors cursor-pointer"
  >
    <span className="text-xs font-medium text-gray-800 flex-grow leading-tight">
      {label}
    </span>
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-gray-800" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </motion.label>
);

const InfoCard = ({ title, description, icon, isGuilty }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 120, damping: 14 }}
    className={`rounded-2xl p-4 border shadow-md text-center ${
      isGuilty ? "bg-green-50 border-green-200" : "bg-rose-50 border-rose-200"
    }`}
  >
    <div className="flex items-center justify-center gap-2 mb-2 text-xl font-bold">
      {icon}
      <h2
        className={`text-lg font-bold ${
          isGuilty ? "text-green-800" : "text-rose-800"
        }`}
      >
        {title}
      </h2>
    </div>
    <p className="text-xs text-gray-700">{description}</p>
  </motion.div>
);

export default function CrimeInferenceApp() {
  const [facts, setFacts] = useState(() => cloneFacts(DEFAULT_FACTS));
  const [suspect, setSuspect] = useState("mary");
  const [crime, setCrime] = useState("assassinat");

  const evaluation = useMemo(
    () => isGuilty(facts, suspect, crime),
    [facts, suspect, crime]
  );

  const resetFacts = () => setFacts(cloneFacts(DEFAULT_FACTS));

  const updateFact = (pred, s, c, value) => {
    setFacts((prev) => {
      const next = cloneFacts(prev);
      if (!next[pred]) next[pred] = {};
      if (!next[pred][s]) next[pred][s] = new Set();
      value ? next[pred][s].add(c) : next[pred][s].delete(c);
      return next;
    });
  };

  const tableRows = SUSPECTS.map((s) => ({
    s,
    verdict: isGuilty(facts, s, crime).guilty,
  }));

  return (
    <div className="min-h-screen lg:h-screen w-full bg-stone-100 text-gray-900 p-4 lg:overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-4 lg:h-full">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-800">
              Enquête policière
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFacts}
            className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium bg-white hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" /> Réinitialiser les faits
          </motion.button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:h-[calc(100%-64px)]">
          <div className="space-y-4 lg:overflow-hidden">
            <Section title="Sélection" icon={<User className="w-4 h-4" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] mb-1.5 font-semibold text-gray-600 uppercase tracking-wider">
                    Suspects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SUSPECTS.map((s) => (
                      <Chip
                        key={s}
                        selected={s === suspect}
                        onClick={() => setSuspect(s)}
                      >
                        {s}
                      </Chip>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] mb-1.5 font-semibold text-gray-600 uppercase tracking-wider">
                    Crimes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CRIMES.map((c) => (
                      <Chip
                        key={c}
                        selected={c === crime}
                        onClick={() => setCrime(c)}
                      >
                        {c}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            </Section>

            <Section
              title="Faits & Preuves"
              icon={<BookOpen className="w-4 h-4" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FactToggle
                  label={`has_motive`}
                  checked={facts.has_motive[suspect]?.has(crime) ?? false}
                  onChange={(v) => updateFact("has_motive", suspect, crime, v)}
                />
                {["vol", "assassinat"].includes(crime) && (
                  <>
                    <FactToggle
                      label={`was_near_crime_scene`}
                      checked={
                        facts.was_near_crime_scene[suspect]?.has(crime) ?? false
                      }
                      onChange={(v) =>
                        updateFact("was_near_crime_scene", suspect, crime, v)
                      }
                    />
                    <FactToggle
                      label={`has_fingerprint_on_weapon`}
                      checked={
                        facts.has_fingerprint_on_weapon[suspect]?.has(crime) ??
                        false
                      }
                      onChange={(v) =>
                        updateFact(
                          "has_fingerprint_on_weapon",
                          suspect,
                          crime,
                          v
                        )
                      }
                    />
                  </>
                )}
                {crime === "escroquerie" && (
                  <>
                    <FactToggle
                      label={`has_bank_transaction`}
                      checked={
                        facts.has_bank_transaction[suspect]?.has(crime) ?? false
                      }
                      onChange={(v) =>
                        updateFact("has_bank_transaction", suspect, crime, v)
                      }
                    />
                    <FactToggle
                      label={`owns_fake_identity`}
                      checked={
                        facts.owns_fake_identity[suspect]?.has(crime) ?? false
                      }
                      onChange={(v) =>
                        updateFact("owns_fake_identity", suspect, crime, v)
                      }
                    />
                  </>
                )}
              </div>
            </Section>

            <Section
              title="Explications (Règles)"
              icon={<Gavel className="w-4 h-4" />}
            >
              <div className="space-y-4">
                {(evaluation.conds ?? []).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Conditions nécessaires (ET)
                    </p>
                    <ul className="space-y-1.5">
                      {evaluation.conds.map((c) => (
                        <li key={c.pred} className="flex items-center gap-2">
                          {c.ok ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {`${c.pred}(${suspect}, ${crime})`}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(evaluation.anyOf ?? []).length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                      Au moins une des conditions (OU)
                    </p>
                    <ul className="space-y-1.5">
                      {evaluation.anyOf.map((a) => (
                        <li key={a.pred} className="flex items-center gap-2">
                          {a.ok ? (
                            <CheckCircle2 className="w-3 h-3 text-green-600" />
                          ) : (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          )}
                          <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 rounded">
                            {`${a.pred}(${suspect}, ${crime})`}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>
          </div>

          <div className="space-y-4 lg:overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${suspect}-${crime}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <InfoCard
                  title={evaluation.guilty ? "Coupable" : "Non coupable"}
                  description={`Verdict pour : is_guilty(${suspect}, ${crime})`}
                  icon={
                    evaluation.guilty ? (
                      <CheckCircle2 className="w-5 h-5 text-green-700" />
                    ) : (
                      <XCircle className="w-5 h-5 text-rose-700" />
                    )
                  }
                  isGuilty={evaluation.guilty}
                />
              </motion.div>
            </AnimatePresence>

            <Section
              title={`Aperçu rapide - ${crime}`}
              icon={<BookOpen className="w-4 h-4" />}
            >
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-3 py-2 text-left">Suspect</th>
                      <th className="px-3 py-2 text-left">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(({ s, verdict }) => (
                      <tr
                        key={s}
                        className="bg-white border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-3 py-2 font-medium capitalize text-gray-800">
                          {s}
                        </td>
                        <td className="px-3 py-2">
                          {verdict ? (
                            <span className="inline-flex items-center gap-1 font-medium text-green-600">
                              <CheckCircle2 className="w-3 h-3" /> Coupable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-medium text-rose-600">
                              <XCircle className="w-3 h-3" /> Non coupable
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}