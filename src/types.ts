export type AgeBand = '6-8' | '9-11' | '12-14';

export interface UserProfile {
  id: number;
  name: string;
  age_band: AgeBand;
  interests: string[];
  created_at: string;
}

export type ProjectType = 'story' | 'invention' | 'science';

export interface ProjectBrief {
  title?: string;
  goal?: string;
  audience?: string;
  characters?: string;
  theme?: string;
  problem?: string;
  solution?: string;
  materials?: string;
  steps?: string;
  [key: string]: any;
}

export interface Project {
  id: number;
  profile_id: number;
  type: ProjectType;
  title: string;
  status: 'active' | 'completed';
  brief: ProjectBrief;
  outputs: any;
  current_step: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTemplate {
  id: ProjectType;
  name: string;
  description: string;
  icon: string;
  steps: {
    id: string;
    question: string;
    field: keyof ProjectBrief;
  }[];
}
