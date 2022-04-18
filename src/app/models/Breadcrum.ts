export class Breadcrumb {
  active: boolean;
  route?: string[];
  title: string;

  constructor(title: string, active = false, route?: string[]) {
      this.title = title;
      this.active = active;
      this.route = route;
  }
}
