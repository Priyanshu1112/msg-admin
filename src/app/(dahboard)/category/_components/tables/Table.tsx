import ChapterTable from "./ChapterTable";
import SubjectTable from "./SubjectTable";
import TopicTable from "./TopicTable";

// Main Component with Clean Switching
const CategoryTable = ({ activeTab }: { activeTab: category }) => {
  switch (activeTab) {
    case "subject":
      return <SubjectTable />;
    case "chapter":
      return <ChapterTable />;
    case "topic":
      return <TopicTable />;
    default:
      return null;
  }
};

export default CategoryTable;
