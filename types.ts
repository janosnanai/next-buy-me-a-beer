export interface AirtableRecord {
  records: Record[];
}

export interface Record {
  createdTime: Date;
  fields: Fields;
  id: string;
}

export interface Fields {
  name: string;
  message: string;
  amount: number;
}
