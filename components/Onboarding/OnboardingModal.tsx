"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Modal, Steps } from "antd";
import { useOnboardingStore } from "@/store/onboarding.store";
import WelcomeScreen from "./WelcomeScreen";
import BasicInfoStep from "./BasicInfoStep";
import DepotStep from "./DepotStep";
import FleetStep from "./FleetStep";
import TeamStep from "./TeamStep";
import CompletionScreen from "./CompletionScreen";

const STEP_ITEMS = [
  { title: "Basics" },
  { title: "Depot" },
  { title: "Fleet" },
  { title: "Team" },
];

const OnboardingModal = () => {
  const {
    onboarding,
    advanceStepAction,
    completeOnboardingAction,
    setShowCompletion,
  } = useOnboardingStore();

  // Local step state: 0=welcome, 1=basic, 2=depot, 3=fleet, 4=team, 5=completion
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  // Ref to prevent duplicate API calls
  const isAdvancingRef = useRef(false);

  // Sync local step with backend onboarding state
  useEffect(() => {
    if (onboarding && !onboarding.is_completed) {
      setIsOpen(true);
      setCurrentStep(onboarding.current_step);
    }
  }, [onboarding]);

  const handleStart = useCallback(async () => {
    if (isAdvancingRef.current) return;

    // Check if backend already at step 1 or beyond
    if (onboarding && onboarding.current_step >= 1) {
      setCurrentStep(1);
      return;
    }

    isAdvancingRef.current = true;
    setCurrentStep(1);
    try {
      await advanceStepAction(1);
    } catch (error) {
      console.error("Failed to advance onboarding step:", error);
      // Don't rollback - let the useEffect sync with backend state
    } finally {
      isAdvancingRef.current = false;
    }
  }, [onboarding, advanceStepAction]);

  const handleBasicInfoNext = useCallback(() => {
    // Note: No advanceStepAction needed here because saveBasicInfoAction
    // already advances current_step to 2 (STEP_DEPOT) in the backend
    setCurrentStep(2);
  }, []);

  const handleDepotNext = useCallback(async () => {
    if (isAdvancingRef.current) return;

    // Check if backend already at step 3 or beyond - just move to next UI step
    if (onboarding && onboarding.current_step >= 3) {
      setCurrentStep(3);
      return;
    }

    isAdvancingRef.current = true;
    setCurrentStep(3);
    try {
      await advanceStepAction(3);
    } catch (error) {
      console.error("Failed to advance onboarding step:", error);
      // Don't rollback - this prevents infinite loops
    } finally {
      isAdvancingRef.current = false;
    }
  }, [onboarding, advanceStepAction]);

  const handleFleetNext = useCallback(async () => {
    if (isAdvancingRef.current) return;

    // Check if backend already at step 4 or beyond
    if (onboarding && onboarding.current_step >= 4) {
      setCurrentStep(4);
      return;
    }

    isAdvancingRef.current = true;
    setCurrentStep(4);
    try {
      await advanceStepAction(4);
    } catch (error) {
      console.error("Failed to advance onboarding step:", error);
    } finally {
      isAdvancingRef.current = false;
    }
  }, [onboarding, advanceStepAction]);

  const handleTeamNext = useCallback(async () => {
    if (isAdvancingRef.current) return;

    isAdvancingRef.current = true;
    setShowCompletion(true);
    setCurrentStep(5);
    try {
      await completeOnboardingAction();
    } catch (error) {
      setShowCompletion(false);
      setCurrentStep(4);
      console.error("Failed to complete onboarding:", error);
    } finally {
      isAdvancingRef.current = false;
    }
  }, [completeOnboardingAction, setShowCompletion]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Don't render if onboarding is complete
  if (!onboarding || onboarding.is_completed) {
    return null;
  }

  const renderContent = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onStart={handleStart} />;
      case 1:
        return <BasicInfoStep onNext={handleBasicInfoNext} />;
      case 2:
        return <DepotStep onNext={handleDepotNext} />;
      case 3:
        return <FleetStep onNext={handleFleetNext} />;
      case 4:
        return <TeamStep onNext={handleTeamNext} />;
      case 5:
        return <CompletionScreen onClose={handleClose} />;
      default:
        return <WelcomeScreen onStart={handleStart} />;
    }
  };

  const showSteps = currentStep >= 1 && currentStep <= 4;

  return (
    <Modal
      open={isOpen}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      width={currentStep === 0 ? 900 : 800}
      centered
      styles={{
        body: {
          padding: 0,
          height: currentStep === 0 ? "500px" : "600px",
          overflow: "hidden",
        },
      }}
    >
      <div className="h-full flex flex-col">
        {showSteps && (
          <div className="px-3 pt-4 border-b border-gray-100">
            <Steps
              size="small"
              current={currentStep - 1}
              items={STEP_ITEMS}
              className="mb-4"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </Modal>
  );
};

export default OnboardingModal;
