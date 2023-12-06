export type State = {
    EventID: string;
    SubjectID: string;
    ToolInstances: string;
    ClientTimestamp: string;
    CourseID: string;
    AssignmentID: string;
    ProblemID: string;
    Attempt: number;
    CodeState: string;
    NoLogging?: boolean;
    Score?: number;
};

export class StateTracker {

    private nextEventID: number = 0;
    private nAttempts: number = 0;

    courseID: string = "test";
    assignmentID: string = "test";
    problemID: string = "103";
    subjectID: string = "";
    toolInstances = "CERPENT-VSCode v0.1";

    incrementAttempt() {
        this.nAttempts++;
    }

    getState(codeState: string, score?: number): State {

        const state = {
            EventID: (this.nextEventID++).toString(),
            SubjectID: this.subjectID,
            ToolInstances: this.toolInstances,
            ClientTimestamp: new Date().toISOString(),
            CourseID: this.courseID,
            AssignmentID: this.assignmentID,
            ProblemID: this.problemID,
            Attempt: this.nAttempts,
            CodeState: codeState,
            NoLogging: false,
            Score: score,
        };
        return state;
    }
}