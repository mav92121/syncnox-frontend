"use client";
import { User } from "lucide-react";
import TeamMemberForm from "@/app/team/_components/TeamMemberForm";
import { useTeamStore } from "@/store/team.store";
import OnboardingListStep from "./OnboardingListStep";

interface TeamStepProps {
  onNext: () => void;
  onBack: () => void;
}

const TeamStep = ({ onNext, onBack }: TeamStepProps) => {
  const { teams } = useTeamStore();

  return (
    <OnboardingListStep
      stepNumber={4}
      totalSteps={4}
      progressPercent={100}
      kicker="Step 4 of 4 · Team"
      title="Add a driver."
      subtitle="Add one driver to see routing in action. You can bulk-invite the rest by email or CSV later."
      items={teams}
      itemLabelSingular="driver"
      itemLabelPlural="Drivers"
      entityType="driver"
      Icon={User}
      FormComponent={TeamMemberForm}
      getItemDisplay={(m) => ({ name: m.name, secondary: m.role_type })}
      onNext={onNext}
      onBack={onBack}
      successMessage="Team member added"
      emptyErrorMessage="Please add at least one team member"
    />
  );
};

export default TeamStep;
