export interface ColumnDef {
  name: string;
  displayName?: string;
  width?: string;
  columnType?: ColumnType;
  property?: Property;
  class?: string;
  defaultText?: string;
  sort?: boolean;
}

export enum ColumnType {
  Text = 'text',
  Button = 'button',
  Info = 'info',
  EditModal = 'editModal',
  Delete = 'delete',
  Download = 'download',
  Select = 'select',
  Date = 'date',
  Hour = 'hour',
  Price = 'price',
  Boolean = 'boolean',
  Percentage = 'percentage',
  EditAndDelete = 'editAndDelete',
  InfoAndDelete = 'infoAndDelete',
  InfoAndMail = 'infoAndMail',
  InfoAndCancel = 'infoAndCancel',
  InfoAndToggle = 'infoAndToggle',
  InvoiceList = 'invoiceList',
}


export enum Property {
  String = 'string',
  Number = 'number',
  Date = 'date',

}
