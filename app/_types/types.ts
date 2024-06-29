export interface Node {
  id: number;
  label: string;
  content: string;
  color?: string;
  title: string;
}

export interface Edge {
  id: number | string;
  from: number;
  to: number;
}
