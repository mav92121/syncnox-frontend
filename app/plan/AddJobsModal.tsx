import JobForm from "@/components/Jobs/JobForm";
import { Modal } from "antd";
import type { Job } from "@/types/job.type";

const AddJobsModal = ({
  open,
  setOpen,
  onJobCreated,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
  /** Optional: called with the created Job after successful submission */
  onJobCreated?: (job: Job) => void;
}) => {
  return (
    <Modal
      footer={null}
      title="Add Job"
      open={open}
      onCancel={() => setOpen(false)}
      width={700}
      centered
      styles={{ body: { overflow: "hidden", height: "80vh" } }}
    >
      <div style={{ height: "100%" }}>
        <JobForm
          onSubmit={(job) => {
            setOpen(false);
            if (job && onJobCreated) {
              onJobCreated(job);
            }
          }}
        />
      </div>
    </Modal>
  );
};

export default AddJobsModal;
