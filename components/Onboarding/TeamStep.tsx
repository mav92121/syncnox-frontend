"use client";
import { User } from "lucide-react";
import TeamMemberForm from "@/app/team/_components/TeamMemberForm";
import { useTeamStore } from "@/store/team.store";
import OnboardingListStep from "./OnboardingListStep";

interface TeamStepProps {
  onNext: () => void;
}

const TeamStep = ({ onNext }: TeamStepProps) => {
  const { teams } = useTeamStore();

  return (
    <OnboardingListStep
      items={teams}
      itemLabelSingular="driver"
      itemLabelPlural="Drivers"
      Icon={User}
      FormComponent={TeamMemberForm}
      getItemDisplay={(m) => ({ name: m.name, secondary: m.role_type })}
      onNext={onNext}
      successMessage="Team member added"
      emptyErrorMessage="Please add at least one team member"
    />
  );
};

export default TeamStep;
