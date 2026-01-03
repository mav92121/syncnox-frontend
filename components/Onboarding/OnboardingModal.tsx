"use client";
import { useState, useEffect } from "react";
import { Modal, Steps } from "antd";
import { useOnboardingStore } from "@/zustand/onboarding.store";
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

  // Sync local step with backend onboarding state
  useEffect(() => {
    if (onboarding && !onboarding.is_completed) {
      setIsOpen(true);
      setCurrentStep(onboarding.current_step);
    }
  }, [onboarding]);

  const handleStart = async () => {
    setCurrentStep(1);
    await advanceStepAction(1);
  };

  const handleBasicInfoNext = async () => {
    setCurrentStep(2);
    await advanceStepAction(2);
  };

  const handleDepotNext = async () => {
    setCurrentStep(3);
    await advanceStepAction(3);
  };

  const handleFleetNext = async () => {
    setCurrentStep(4);
    await advanceStepAction(4);
  };

  const handleTeamNext = async () => {
    setShowCompletion(true);
    setCurrentStep(5);
    await completeOnboardingAction();
  };

  const handleClose = () => {
    setIsOpen(false);
  };

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
