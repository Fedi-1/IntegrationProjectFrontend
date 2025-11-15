export interface SubjectInfo {
  name: string;
  difficulty?: string;
  hoursPerWeek?: number;
}

export interface ScheduleGenerationRequest {
  name: string;
  age: number;
  subjects: SubjectInfo[];
  max_study_duration?: number;
  examDates?: { [key: string]: string };
  learningPreferences?: { [key: string]: any };
  constraints?: { [key: string]: any };
}

export interface ActivityBlock {
  activity: string;
  durationMinutes: number;
  subject?: string;
  topic?: string;
}

export interface DaySchedule {
  [timeSlot: string]: ActivityBlock;
}

export interface WeekSchedule {
  [day: string]: DaySchedule;
}

export interface ScheduleGenerationResponse {
  schedule: WeekSchedule;
  message: string;
  success: boolean;
}

export interface Student {
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  age: number;
  phoneNumber?: string;
}
