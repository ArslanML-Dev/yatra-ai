"use client";

import { createContext, useContext, useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { GroupType, Pace, WalkingTolerance } from "@/types/user-preferences";
import type { ProfilePreferences } from "@/types/profile";
import type { PlaceCategory } from "@/types/place";
import { useProfile } from "@/lib/profile/use-profile";
import { formatCategoryLabel } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

interface ProfileUIContextValue {
  open: boolean;
  togglePanel: () => void;
  closePanel: () => void;
}

const ProfileUIContext = createContext<ProfileUIContextValue | null>(null);

export function ProfileUIProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value: ProfileUIContextValue = {
    open,
    togglePanel: () => setOpen((v) => !v),
    closePanel: () => setOpen(false),
  };
  return <ProfileUIContext.Provider value={value}>{children}</ProfileUIContext.Provider>;
}

export function useProfileUI(): ProfileUIContextValue {
  const ctx = useContext(ProfileUIContext);
  if (!ctx) {
    throw new Error("useProfileUI() must be used within <ProfileUIProvider>");
  }
  return ctx;
}

const GROUPS: GroupType[] = ["solo", "couple", "family", "friends", "business"];
const PACES: Pace[] = ["relaxed", "moderate", "packed"];
const INTERESTS: PlaceCategory[] = ["heritage", "food", "shopping", "parks", "modern"];
const WALKING_TOLERANCES: WalkingTolerance[] = ["minimal", "moderate", "high"];
const DIETARY_OPTIONS = ["no-preference", "veg", "non-veg"] as const;
const SPICE_OPTIONS = ["mild", "medium", "spicy"] as const;

function pillClass(active: boolean): string {
  return cn(
    "rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors",
    active ? "bg-navy-900 text-ivory" : "bg-sandstone-100 text-ink-soft hover:bg-sandstone-200",
  );
}

/**
 * Global local-profile overlay — same architectural family as
 * TravelAgentPanel (co-located UI context, mounted once via
 * AppProviders, reachable from any route via a NavBar trigger). Saving
 * writes only to the local profile store; it never touches Trip. See
 * PlannerForm.tsx for the one place these preferences feed a new trip's
 * defaults.
 */
export function ProfilePanel() {
  const { open, closePanel } = useProfileUI();
  const { profile, hydrated, saveProfile, clearProfile } = useProfile();
  const prefersReducedMotion = useReducedMotion();

  const [name, setName] = useState("");
  const [preferences, setPreferences] = useState<ProfilePreferences>({});
  const [savedJustNow, setSavedJustNow] = useState(false);
  const [wasOpen, setWasOpen] = useState(false);

  // Loads the current saved profile into the draft form on the transition
  // from closed to open (not on every render) so an unsaved edit in
  // progress isn't clobbered by the panel re-rendering for unrelated
  // reasons. Adjusted during render rather than in an effect — React's
  // sanctioned pattern for resetting state on a prop/condition change.
  if (open && !wasOpen && hydrated) {
    setWasOpen(true);
    setName(profile?.name ?? "");
    setPreferences(profile?.preferences ?? {});
    setSavedJustNow(false);
  } else if (!open && wasOpen) {
    setWasOpen(false);
  }

  function toggleInterest(interest: PlaceCategory) {
    setPreferences((prev) => {
      const current = prev.interests ?? [];
      const has = current.includes(interest);
      return { ...prev, interests: has ? current.filter((i) => i !== interest) : [...current, interest] };
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    saveProfile(name.trim() || undefined, preferences);
    setSavedJustNow(true);
  }

  function handleClear() {
    clearProfile();
    setName("");
    setPreferences({});
    setSavedJustNow(false);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-60 flex justify-end"
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close profile"
            onClick={closePanel}
            className="absolute inset-0 bg-navy-950/40"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Your profile"
            className="relative flex h-full w-full flex-col overflow-y-auto bg-ivory shadow-lift sm:w-105 sm:border-l sm:border-sandstone-200/70"
            initial={prefersReducedMotion ? undefined : { x: "100%" }}
            animate={{ x: 0 }}
            exit={prefersReducedMotion ? undefined : { x: "100%" }}
            transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", damping: 32, stiffness: 320 }}
          >
            <div className="flex items-center justify-between border-b border-sandstone-200/70 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <span
                  aria-hidden="true"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-900 text-base"
                >
                  👤
                </span>
                <div>
                  <h2 className="text-h4 font-display text-navy-900">Your profile</h2>
                  <p className="text-caption text-ink-soft/60">Stored only on this device</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closePanel}
                aria-label="Close profile"
                className="rounded-full p-1.5 text-ink-soft transition-colors hover:bg-sandstone-100"
              >
                ✕
              </button>
            </div>

            {!hydrated ? null : (
              <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6 px-6 py-6">
                <p className="text-body-sm text-ink-soft">
                  No account, no server — these preferences live in this browser only, and
                  pre-fill a new trip plan on this device. They never change a trip you&rsquo;ve
                  already generated.
                </p>

                <div>
                  <label htmlFor="profile-name" className="text-caption font-medium uppercase text-ink-soft/70">
                    Name (optional)
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="What should we call you?"
                    className="mt-2 block w-full rounded-xl border border-sandstone-200 px-4 py-2.5 text-sm outline-none focus-visible:border-saffron-500"
                  />
                </div>

                <div>
                  <p id="profile-group-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Usually travelling as
                  </p>
                  <div role="group" aria-labelledby="profile-group-label" className="mt-2 flex flex-wrap gap-2">
                    {GROUPS.map((group) => (
                      <button
                        key={group}
                        type="button"
                        aria-pressed={preferences.group === group}
                        onClick={() => setPreferences((prev) => ({ ...prev, group }))}
                        className={pillClass(preferences.group === group)}
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p id="profile-pace-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Preferred pace
                  </p>
                  <div role="group" aria-labelledby="profile-pace-label" className="mt-2 flex flex-wrap gap-2">
                    {PACES.map((pace) => (
                      <button
                        key={pace}
                        type="button"
                        aria-pressed={preferences.pace === pace}
                        onClick={() => setPreferences((prev) => ({ ...prev, pace }))}
                        className={pillClass(preferences.pace === pace)}
                      >
                        {pace}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p id="profile-interests-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Usual interests
                  </p>
                  <div role="group" aria-labelledby="profile-interests-label" className="mt-2 flex flex-wrap gap-2">
                    {INTERESTS.map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        aria-pressed={Boolean(preferences.interests?.includes(interest))}
                        onClick={() => toggleInterest(interest)}
                        className={pillClass(Boolean(preferences.interests?.includes(interest)))}
                      >
                        {formatCategoryLabel(interest)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p id="profile-walking-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Walking tolerance
                  </p>
                  <div role="group" aria-labelledby="profile-walking-label" className="mt-2 flex flex-wrap gap-2">
                    {WALKING_TOLERANCES.map((tolerance) => (
                      <button
                        key={tolerance}
                        type="button"
                        aria-pressed={preferences.walkingTolerance === tolerance}
                        onClick={() => setPreferences((prev) => ({ ...prev, walkingTolerance: tolerance }))}
                        className={pillClass(preferences.walkingTolerance === tolerance)}
                      >
                        {tolerance}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p id="profile-diet-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Dietary preference
                  </p>
                  <div role="group" aria-labelledby="profile-diet-label" className="mt-2 flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={preferences.foodPreferences?.dietary === option}
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            foodPreferences: { ...prev.foodPreferences, dietary: option },
                          }))
                        }
                        className={pillClass(preferences.foodPreferences?.dietary === option)}
                      >
                        {option === "no-preference" ? "No preference" : option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p id="profile-spice-label" className="text-caption font-medium uppercase text-ink-soft/70">
                    Spice tolerance
                  </p>
                  <div role="group" aria-labelledby="profile-spice-label" className="mt-2 flex flex-wrap gap-2">
                    {SPICE_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={preferences.foodPreferences?.spiceTolerance === option}
                        onClick={() =>
                          setPreferences((prev) => ({
                            ...prev,
                            foodPreferences: { ...prev.foodPreferences, spiceTolerance: option },
                          }))
                        }
                        className={pillClass(preferences.foodPreferences?.spiceTolerance === option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-3 border-t border-sandstone-200/70 pt-5">
                  {savedJustNow && (
                    <p className="text-xs font-medium text-leaf-600">Saved on this device.</p>
                  )}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-medium text-ivory transition-colors hover:bg-navy-800"
                    >
                      Save profile
                    </button>
                    {profile && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="rounded-full border border-navy-900/20 px-5 py-2.5 text-sm font-medium text-navy-900 transition-colors hover:bg-sandstone-100"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
