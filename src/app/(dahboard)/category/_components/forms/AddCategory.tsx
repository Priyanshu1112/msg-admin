import { category } from "../Category";
import AddChapterForm, { ChapterFormProps } from "./ChapterForm";
import AddSubjectForm, { SubjectFormProps } from "./SubjectForm";
import AddTopicForm from "./TopicForm";

// Main Component with Clean Switching
const AddCategory = ({
  activeTab,
  trigger = true,
  open = false,
  onOpenChange,
  edit = false,
}: ChapterFormProps & SubjectFormProps & { activeTab: category }) => {
  switch (activeTab) {
    case "subject":
      return (
        <AddSubjectForm
          trigger={trigger}
          open={open}
          onOpenChange={onOpenChange}
          edit={edit}
        />
      );
    case "chapter":
      return (
        <AddChapterForm
          trigger={trigger}
          open={open}
          onOpenChange={onOpenChange}
          edit={edit}
        />
      );
    case "topic":
      return (
        <AddTopicForm
          trigger={trigger}
          open={open}
          onOpenChange={onOpenChange}
          edit={edit}
        />
      );
    default:
      return null;
  }
};

export default AddCategory;
