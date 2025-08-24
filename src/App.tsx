import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Info,
  User,
  Gavel,
  BookOpen,
} from "lucide-react";

const CRIMES = ["assassinat", "vol", "escroquerie"] as const;
const SUSPECTS = ["john", "mary", "alice", "bruno", "sophie"] as const;

type Crime = (typeof CRIMES)[number];
type Suspect = (typeof SUSPECTS)[number];

const DEFAULT_FACTS: Record<string, Record<Suspect, Set<Crime>>> = {
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

function cloneFacts(
  facts: Record<string, Record<Suspect, Set<Crime>>>
): Record<string, Record<Suspect, Set<Crime>>> {
  const out: any = {};
  for (const pred of Object.keys(facts)) {
    out[pred] = {} as Record<Suspect, Set<Crime>>;
    for (const s of SUSPECTS) out[pred][s] = new Set(facts[pred][s]);
  }
  return out;
}

function isGuilty(
  facts: Record<string, Record<Suspect, Set<Crime>>>,
  suspect: Suspect,
  crime: Crime
) {
  const H = (pred: string) => facts[pred]?.[suspect]?.has(crime) ?? false;

  if (crime === "vol" || crime === "assassinat") {
    const conds = [
      { pred: "has_motive", ok: H("has_motive") },
      { pred: "was_near_crime_scene", ok: H("was_near_crime_scene") },
      { pred: "has_fingerprint_on_weapon", ok: H("has_fingerprint_on_weapon") },
    ];
    const guilty = conds.every((c) => c.ok);
    return { guilty, conds, anyOf: [] as string[] };
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
  return { guilty: false, conds: [], anyOf: [] as any[] };
}

const Section: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl shadow-gray-200/50">
    <div className="flex items-center gap-3 mb-4 text-gray-700">
      {icon}
      <h3 className="text-sm font-semibold tracking-wide uppercase">{title}</h3>
    </div>
    {children}
  </div>
);

const Chip: React.FC<{
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ selected, onClick, children }) => (
  <motion.button
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border shadow-sm ${
      selected
        ? "bg-stone-900 text-white border-stone-900"
        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
    }`}
  >
    {children}
  </motion.button>
);

const FactToggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <motion.label
    whileHover={{ scale: 1.01 }}
    className="flex items-start gap-4 px-4 py-3 rounded-2xl border bg-white shadow-sm transition-colors cursor-pointer"
  >
    <span className="text-sm font-medium text-gray-800 flex-grow leading-tight">
      {label}
    </span>
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-gray-800" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  </motion.label>
);

const InfoCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  isGuilty: boolean;
}> = ({ title, description, icon, isGuilty }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: "spring", stiffness: 120, damping: 14 }}
    className={`rounded-3xl p-6 border shadow-lg text-center ${
      isGuilty ? "bg-green-50 border-green-200" : "bg-rose-50 border-rose-200"
    }`}
  >
    <div className="flex items-center justify-center gap-3 mb-3 text-2xl font-bold">
      {icon}
      <h2
        className={`text-xl font-bold ${
          isGuilty ? "text-green-800" : "text-rose-800"
        }`}
      >
        {title}
      </h2>
    </div>
    <p className="text-sm text-gray-700">{description}</p>
  </motion.div>
);

export default function CrimeInferenceApp() {
  const [facts, setFacts] = useState(() => cloneFacts(DEFAULT_FACTS));
  const [suspect, setSuspect] = useState<Suspect>("mary");
  const [crime, setCrime] = useState<Crime>("assassinat");

  const evaluation = useMemo(
    () => isGuilty(facts, suspect, crime),
    [facts, suspect, crime]
  );

  const resetFacts = () => setFacts(cloneFacts(DEFAULT_FACTS));

  const updateFact = (pred: string, s: Suspect, c: Crime, value: boolean) => {
    setFacts((prev) => {
      const next = cloneFacts(prev);
      if (!next[pred]) next[pred] = {} as any;
      if (!next[pred][s]) next[pred][s] = new Set<Crime>();
      value ? next[pred][s].add(c) : next[pred][s].delete(c);
      return next;
    });
  };

  const tableRows = SUSPECTS.map((s) => ({
    s,
    verdict: isGuilty(facts, s, crime).guilty,
  }));

  return (
    <div className="min-h-screen w-full bg-stone-100 text-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-800">
              Enquête policière
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetFacts}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium bg-white hover:bg-gray-50 shadow-sm"
          >
            <RefreshCw className="w-4 h-4" /> Réinitialiser les faits
          </motion.button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <Section title="Sélection" icon={<User className="w-5 h-5" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-xs mb-2 font-semibold text-gray-600 uppercase tracking-wider">
                    Suspects
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                  <p className="text-xs mb-2 font-semibold text-gray-600 uppercase tracking-wider">
                    Crimes
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                      <CheckCircle2 className="w-6 h-6 text-green-700" />
                    ) : (
                      <XCircle className="w-6 h-6 text-rose-700" />
                    )
                  }
                  isGuilty={evaluation.guilty}
                />
              </motion.div>
            </AnimatePresence>

          </div>

          <div className="space-y-8">
            <Section
              title="Faits & Preuves"
              icon={<BookOpen className="w-5 h-5" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              icon={<Gavel className="w-5 h-5" />}
            >
              <div className="space-y-4">
                {(evaluation.conds ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Conditions nécessaires (ET)
                    </p>
                    <ul className="space-y-2">
                      {evaluation.conds.map((c) => (
                        <li key={c.pred} className="flex items-center gap-2">
                          {c.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <code className="font-mono text-sm bg-gray-100 p-1 rounded">
                            {`${c.pred}(${suspect}, ${crime})`}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {(evaluation.anyOf ?? []).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                      Au moins une des conditions (OU)
                    </p>
                    <ul className="space-y-2">
                      {evaluation.anyOf.map((a) => (
                        <li key={a.pred} className="flex items-center gap-2">
                          {a.ok ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600" />
                          )}
                          <code className="font-mono text-sm bg-gray-100 p-1 rounded">
                            {`${a.pred}(${suspect}, ${crime})`}
                          </code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Section>

            <Section
              title={`Aperçu rapide - ${crime}`}
              icon={<BookOpen className="w-5 h-5" />}
            >
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">Suspect</th>
                      <th className="px-4 py-3 text-left">Verdict</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map(({ s, verdict }) => (
                      <tr
                        key={s}
                        className="bg-white border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-medium capitalize text-gray-800">
                          {s}
                        </td>
                        <td className="px-4 py-3">
                          {verdict ? (
                            <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
                              <CheckCircle2 className="w-4 h-4" /> Coupable
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-medium text-rose-600">
                              <XCircle className="w-4 h-4" /> Non coupable
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