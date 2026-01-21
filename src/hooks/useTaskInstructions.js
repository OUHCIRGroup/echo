import { useState, useEffect, useCallback, useRef } from "react";
import { useStudyFlow } from "../context/study-flow-context";

/**
 * Custom hook to manage task instruction popups based on admin configuration
 *
 * Usage:
 * const {
 *   currentPopup,
 *   dismissPopup,
 *   triggerAfterResponse,
 *   triggerOnSubmit
 * } = useTaskInstructions();
 */
export const useTaskInstructions = (options = {}) => {
  const { timeRemainingSeconds = null } = options;

  const { taskInstructions, isLoading } = useStudyFlow();
  const [currentPopup, setCurrentPopup] = useState(null);
  const [popupQueue, setPopupQueue] = useState([]);
  const [shownPopups, setShownPopups] = useState(new Set());
  const [responseCount, setResponseCount] = useState(0);

  const periodicTimerRef = useRef(null);
  const timeWarningShownRef = useRef(false);
  const startShownRef = useRef(false);

  // Show a popup
  const showPopup = useCallback((instruction) => {
    if (!instruction || !instruction.enabled) return;

    setCurrentPopup({
      id: instruction.id,
      title: instruction.title,
      message: instruction.message,
      trigger: instruction.trigger,
    });
  }, []);

  // Add to queue
  const queuePopup = useCallback((instruction) => {
    if (!instruction || !instruction.enabled) return;

    // Prevent duplicate queuing
    setPopupQueue((prev) => {
      if (prev.some((p) => p.id === instruction.id)) return prev;
      return [...prev, instruction];
    });
  }, []);

  // Dismiss current popup and show next in queue
  const dismissPopup = useCallback(() => {
    setCurrentPopup(null);

    // Show next popup from queue after a small delay
    setTimeout(() => {
      setPopupQueue((prev) => {
        if (prev.length > 0) {
          const [next, ...rest] = prev;
          showPopup(next);
          return rest;
        }
        return prev;
      });
    }, 300);
  }, [showPopup]);

  // Trigger: onStart (called once when task starts)
  useEffect(() => {
    if (isLoading || startShownRef.current) return;

    const dataQuality = taskInstructions?.dataQuality;
    if (dataQuality?.enabled && dataQuality.trigger === "onStart") {
      startShownRef.current = true;
      // Small delay to let UI render first
      setTimeout(() => {
        showPopup(dataQuality);
      }, 500);
    }
  }, [taskInstructions, isLoading, showPopup]);

  // Trigger: periodic (save draft reminder)
  useEffect(() => {
    if (isLoading) return;

    const saveDraft = taskInstructions?.saveDraft;
    if (!saveDraft?.enabled || saveDraft.trigger !== "periodic") return;

    const intervalMs = (saveDraft.intervalSeconds || 300) * 1000;

    periodicTimerRef.current = setInterval(() => {
      if (!currentPopup) {
        queuePopup(saveDraft);
      }
    }, intervalMs);

    return () => {
      if (periodicTimerRef.current) {
        clearInterval(periodicTimerRef.current);
      }
    };
  }, [taskInstructions, isLoading, currentPopup, queuePopup]);

  // Trigger: timeRemaining (time warning)
  useEffect(() => {
    if (isLoading || timeWarningShownRef.current) return;
    if (timeRemainingSeconds === null) return;

    const timeWarning = taskInstructions?.timeWarning;
    if (!timeWarning?.enabled || timeWarning.trigger !== "timeRemaining")
      return;

    const threshold = timeWarning.thresholdSeconds || 300;

    if (timeRemainingSeconds <= threshold && timeRemainingSeconds > 0) {
      timeWarningShownRef.current = true;
      queuePopup(timeWarning);
    }
  }, [taskInstructions, isLoading, timeRemainingSeconds, queuePopup]);

  // Trigger: afterResponse (take notes, rate response)
  const triggerAfterResponse = useCallback(() => {
    if (isLoading) return;

    const newCount = responseCount + 1;
    setResponseCount(newCount);

    // Check takeNotes instruction
    const takeNotes = taskInstructions?.takeNotes;
    if (takeNotes?.enabled && takeNotes.trigger === "afterResponse") {
      const triggerCount = takeNotes.triggerCount || 2;
      if (newCount % triggerCount === 0) {
        queuePopup(takeNotes);
      }
    }

    // Check rateResponse instruction
    const rateResponse = taskInstructions?.rateResponse;
    if (rateResponse?.enabled && rateResponse.trigger === "afterResponse") {
      const triggerCount = rateResponse.triggerCount || 1;
      if (newCount % triggerCount === 0) {
        queuePopup(rateResponse);
      }
    }
  }, [taskInstructions, isLoading, responseCount, queuePopup]);

  // Trigger: onSubmit (returns instruction if enabled, for confirmation dialog)
  const getSubmitConfirmation = useCallback(() => {
    if (isLoading) return null;

    const submitConfirm = taskInstructions?.submitConfirm;
    if (submitConfirm?.enabled && submitConfirm.trigger === "onSubmit") {
      return submitConfirm;
    }
    return null;
  }, [taskInstructions, isLoading]);

  // Show submit confirmation popup
  const triggerOnSubmit = useCallback(() => {
    const submitConfirm = getSubmitConfirmation();
    if (submitConfirm) {
      showPopup(submitConfirm);
      return true; // Popup shown, wait for confirmation
    }
    return false; // No popup, proceed with submit
  }, [getSubmitConfirmation, showPopup]);

  // Process queue when no current popup
  useEffect(() => {
    if (!currentPopup && popupQueue.length > 0) {
      const [next, ...rest] = popupQueue;
      showPopup(next);
      setPopupQueue(rest);
    }
  }, [currentPopup, popupQueue, showPopup]);

  return {
    currentPopup,
    dismissPopup,
    triggerAfterResponse,
    triggerOnSubmit,
    getSubmitConfirmation,
    isLoading,
    responseCount,
  };
};

export default useTaskInstructions;
