"use client";

import { createContext, useEffect, useReducer, type ReactNode } from "react";
import type { Place, PlaceCategory } from "@/types/place";
import type { Pace, UserPreferences } from "@/types/user-preferences";
import type { NamedLocation, NavigationMode, ReferencePoint, Trip } from "@/types/trip";
import { tripReducer, type TripAction, type TripState } from "./trip-reducer";
import { clearStoredTrip, loadTrip, saveTrip } from "./persist";
import { loadSavedPlaceIds, saveSavedPlaceIds } from "./saved-places-persist";

interface StoreState {
  trip: TripState;
  savedPlaceIds: string[];
  // Ephemeral, session-only — a sibling of `trip`, not a field on it, so
  // it's available on every place page regardless of whether a trip
  // exists yet. Deliberately not persisted (matching its own documented
  // "re-derived per use" intent): starts null on every load rather than
  // surviving a reload, same as ConversationState.
  referencePoint: ReferencePoint | null;
  hydrated: boolean;
}

type StoreAction =
  | TripAction
  | { type: "HYDRATE"; trip: Trip | null; savedPlaceIds: string[] }
  | { type: "TOGGLE_SAVED_PLACE"; placeId: string }
  | { type: "SET_REFERENCE_POINT"; referencePoint: ReferencePoint | null };

const initialState: StoreState = { trip: null, savedPlaceIds: [], referencePoint: null, hydrated: false };

function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, trip: action.trip, savedPlaceIds: action.savedPlaceIds, hydrated: true };
    case "TOGGLE_SAVED_PLACE":
      return {
        ...state,
        savedPlaceIds: state.savedPlaceIds.includes(action.placeId)
          ? state.savedPlaceIds.filter((id) => id !== action.placeId)
          : [...state.savedPlaceIds, action.placeId],
      };
    case "SET_REFERENCE_POINT":
      return { ...state, referencePoint: action.referencePoint };
    default:
      return { ...state, trip: tripReducer(state.trip, action) };
  }
}

export interface TripContextValue {
  trip: Trip | null;
  savedPlaceIds: string[];
  referencePoint: ReferencePoint | null;
  hydrated: boolean;
  startTrip: (trip: Trip) => void;
  clearTrip: () => void;
  addStop: (dayNumber: number, place: Place) => void;
  addAndLockStop: (dayNumber: number, place: Place) => void;
  removeStop: (slotId: string) => void;
  removeMatchingCategory: (category: PlaceCategory, placesById: Map<string, Place>) => void;
  reorderStop: (dayNumber: number, slotId: string, direction: "up" | "down") => void;
  moveStopToDay: (slotId: string, toDayNumber: number) => void;
  toggleLock: (slotId: string) => void;
  regenerateDay: (dayNumber: number, allPlaces: Place[], paceOverride?: Pace) => void;
  updatePreferences: (preferences: Partial<UserPreferences>, allPlaces: Place[]) => void;
  updatePreferenceMetadata: (
    preferences: Partial<Pick<UserPreferences, "walkingTolerance" | "foodPreferences">>,
  ) => void;
  setReferencePoint: (referencePoint: ReferencePoint | null) => void;
  setCurrentStop: (dayNumber: number, slotId: string) => void;
  markVisited: (slotId: string) => void;
  markSkipped: (slotId: string) => void;
  setNavigationMode: (mode: NavigationMode) => void;
  setAccommodationLocation: (location: NamedLocation | null) => void;
  setStartLocation: (location: NamedLocation | null) => void;
  advanceToNextStop: () => void;
  toggleSavedPlace: (placeId: string) => void;
  isSaved: (placeId: string) => boolean;
}

export const TripContext = createContext<TripContextValue | null>(null);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    dispatch({ type: "HYDRATE", trip: loadTrip(), savedPlaceIds: loadSavedPlaceIds() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    if (state.trip) saveTrip(state.trip);
    else clearStoredTrip();
  }, [state.trip, state.hydrated]);

  useEffect(() => {
    if (!state.hydrated) return;
    saveSavedPlaceIds(state.savedPlaceIds);
  }, [state.savedPlaceIds, state.hydrated]);

  const value: TripContextValue = {
    trip: state.trip,
    savedPlaceIds: state.savedPlaceIds,
    referencePoint: state.referencePoint,
    hydrated: state.hydrated,
    startTrip: (newTrip) => dispatch({ type: "START_TRIP", trip: newTrip }),
    clearTrip: () => dispatch({ type: "CLEAR_TRIP" }),
    addStop: (dayNumber, place) => dispatch({ type: "ADD_STOP", dayNumber, place }),
    addAndLockStop: (dayNumber, place) => dispatch({ type: "ADD_AND_LOCK_STOP", dayNumber, place }),
    removeStop: (slotId) => dispatch({ type: "REMOVE_STOP", slotId }),
    removeMatchingCategory: (category, placesById) =>
      dispatch({ type: "REMOVE_MATCHING_CATEGORY", category, placesById }),
    reorderStop: (dayNumber, slotId, direction) =>
      dispatch({ type: "REORDER_STOP", dayNumber, slotId, direction }),
    moveStopToDay: (slotId, toDayNumber) =>
      dispatch({ type: "MOVE_STOP_TO_DAY", slotId, toDayNumber }),
    toggleLock: (slotId) => dispatch({ type: "TOGGLE_LOCK", slotId }),
    regenerateDay: (dayNumber, allPlaces, paceOverride) =>
      dispatch({ type: "REGENERATE_DAY", dayNumber, allPlaces, paceOverride }),
    updatePreferences: (preferences, allPlaces) =>
      dispatch({ type: "UPDATE_PREFERENCES", preferences, allPlaces }),
    updatePreferenceMetadata: (preferences) =>
      dispatch({ type: "UPDATE_PREFERENCE_METADATA", preferences }),
    setReferencePoint: (referencePoint) => dispatch({ type: "SET_REFERENCE_POINT", referencePoint }),
    setCurrentStop: (dayNumber, slotId) => dispatch({ type: "SET_CURRENT_STOP", dayNumber, slotId }),
    markVisited: (slotId) => dispatch({ type: "MARK_VISITED", slotId }),
    markSkipped: (slotId) => dispatch({ type: "MARK_SKIPPED", slotId }),
    setNavigationMode: (mode) => dispatch({ type: "SET_NAVIGATION_MODE", mode }),
    setAccommodationLocation: (location) => dispatch({ type: "SET_ACCOMMODATION_LOCATION", location }),
    setStartLocation: (location) => dispatch({ type: "SET_START_LOCATION", location }),
    advanceToNextStop: () => dispatch({ type: "ADVANCE_TO_NEXT_STOP" }),
    toggleSavedPlace: (placeId) => dispatch({ type: "TOGGLE_SAVED_PLACE", placeId }),
    isSaved: (placeId) => state.savedPlaceIds.includes(placeId),
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}
