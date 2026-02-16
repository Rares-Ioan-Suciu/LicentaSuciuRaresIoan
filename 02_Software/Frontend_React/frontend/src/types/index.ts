export interface Resource {
    id: string;
    title: string;
    url: string | null;
    type: 'link' | 'pdf';
}

export interface Announcement {
    id: string;
    content: string;
    author_name: string;
    posted_at: string;
}

export interface ClassroomData {
    id: string;
    name: string;
    description: string;
    teacher_id: string;
    whiteboard_id?: string;
    announcements: Announcement[];
    resources: Resource[];
}

export interface AttendanceSession {
    id: string;
    code: string;
    is_active: boolean;
    present_count: number;
    present_student_ids: string[];
}

export interface Student {
    id: string;
    full_name: string;
    email: string;
}

export interface Submission {
    id: string;
    student_id: string;
    student_name: string;
    content_text: string;
    grade?: number;
    feedback?: string;
    submitted_at: string;
}

export interface Assignment {
    id: string;
    class_id: string;
    title: string;
    description: string;
    due_date: string;
    created_at: string;
}