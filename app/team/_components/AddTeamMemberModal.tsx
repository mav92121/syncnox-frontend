import TeamMemberForm from "./TeamMemberForm";
import { Modal } from "antd";

const AddTeamMemberModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) => {
  return (
    <Modal
      footer={null}
      title="Add Team Member"
      open={open}
      onCancel={() => setOpen(false)}
      width={900}
      centered
      styles={{ body: { overflow: "hidden", height: "80vh" } }}
    >
      <div style={{ height: "100%" }}>
        <TeamMemberForm onSubmit={() => setOpen(false)} />
      </div>
    </Modal>
  );
};

export default AddTeamMemberModal;
