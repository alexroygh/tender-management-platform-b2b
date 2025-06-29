export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export interface Company {
  id: number;
  name: string;
  industry: string | null;
  description: string | null;
  created_at: string;
}

export interface UserCompanyMap {
  id: number;
  user_id: number;
  company_id: number;
}

export interface GoodsAndServices {
  id: number;
  company_id: number;
  name: string;
}

export interface Tender {
  id: number;
  company_id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  budget: string | null;
  created_at: string;
}

export interface Application {
  id: number;
  tender_id: number;
  company_id: number;
  proposal: string | null;
  created_at: string;
} 