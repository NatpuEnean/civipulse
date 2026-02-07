import IssueForm from "./components/IssueForm";
import StatusCheck from "./components/StatusCheck";
import "./App.css";

export default function App() {
  return (
    <div>
      <IssueForm />
      <hr />
      <StatusCheck />
    </div>
  );
}
