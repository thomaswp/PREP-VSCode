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
    CodeStateSelection?: string;
    NoLogging?: boolean;
    Score?: number;
};

export class StateTracker {

    private nextEventID: number = 0;
    private nAttempts: number = 0;

    // TODO: get from course config
    courseID: string = "test";
    assignmentID: string = undefined;
    subjectID: string = "";
    toolInstances = "CERPENT-VSCode v0.1";

    incrementAttempt() {
        this.nAttempts++;
    }

    getState(codeState: string, problemID?: string, score?: number): State {

        const state = {
            EventID: (this.nextEventID++).toString(),
            SubjectID: this.subjectID,
            ToolInstances: this.toolInstances,
            ClientTimestamp: new Date().toISOString(),
            CourseID: this.courseID,
            AssignmentID: this.assignmentID,
            ProblemID: problemID,
            Attempt: this.nAttempts,
            CodeState: codeState,
            NoLogging: false,
            Score: score,
        };
        return state;
    }
}