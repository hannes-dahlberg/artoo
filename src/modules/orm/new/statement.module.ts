export interface IJoin {
  foreignTable: string;
  alias: string;
  foreignColumn: string;
  table: string;
  column: string;
}

export enum wherePreEnum {
  AND = "and",
  OR = "or"
}

export interface IWhere {
  table?: string;
  column: string;
  operator: string;
  value: string;
}
interface IWhereStatement extends IWhere {
  pre: wherePreEnum;
}

export interface IOrderBy {
  table: string;
  column: string;
  descending: boolean;
}

export interface ILimit {
  from: number,
  to: number
}

export class StatementModule {
  private _selects: string[];
  private _table: string;
  private _joins: IJoin[];
  private _wheres: Array<IWhereStatement | IWhereStatement[]>;
  private _orderBys: IOrderBy[];
  private _limit: ILimit;

  public select(fields: string[]): StatementModule {
    this._selects.push(...fields);
    return this;
  }

  public table(table: string): StatementModule {
    this._table = table;
    return this;
  }

  public where(where: IWhere | IWhere[]): StatementModule {
    return this._addWheres(where);
  }

  public andWhere(where: IWhere | IWhere[]) {
    return this._addWheres(where, wherePreEnum.AND);
  }

  public orWhere(where: IWhere | IWhere[]) {
    return this._addWheres(where, wherePreEnum.OR);
  }

  private _addWheres(where: IWhere | IWhere[], pre: wherePreEnum = wherePreEnum.AND): StatementModule {
    if (!(where instanceof Array)) {
      where = [where];
    }
    this._wheres.push(where.map((where: IWhere) => ({ pre, ...where })));
    return this;
  }


  public join(join: IJoin): StatementModule {
    this._joins.push(join);
    return this;
  }

  public orderBy(orderBy: IOrderBy): StatementModule {
    this._orderBys.push(orderBy);
    return this;
  }

  public limit(from: number, to?: number): StatementModule {
    if (to !== undefined) {
      this._limit = { from, to };
    } else {
      this._limit = { from: 0, to: from };
    }

    return this;
  }

  public statement: string;
  public prepareStatement(): void {
    const generateWhereStatement = (wheres: Array<IWhereStatement | IWhereStatement[]>): string => {
      const whereStatement = (where: IWhereStatement): string => {
        return `${where.pre} ${where.table !== undefined ? `${where.table}.` : ``}${where.column} ${where.operator} '${where.value}'`;
      }

      let statement: string = ``;
      for (const where of wheres) {
        if (where instanceof Array) {
          statement += `(${generateWhereStatement(where)}) `;
        } else {
          statement += `${whereStatement(where)} `;
        }
      }

      return statement.replace(/(AND|OR) /, ``);
    }

    const generateJoinStatment = (joins: IJoin[]): string => {
      let statement: string = ``;
      for (const join of joins) {
        statement += `JOIN [${join.foreignTable}] AS [${join.alias}] ON [${join.table}].[${join.column}] = [${join.alias}].[${join.foreignColumn}]`;
      }
      return statement;
    };

    const generateOrderByStatement = (orderBys: IOrderBy[]) => {
      let statement: string = ``;
      for (const orderBy of orderBys) {
        statement += `, [${orderBy.table}].[${orderBy.column}] ${orderBy.descending ? `DESC` : 'ASC'}`
      }

      return statement.replace(/\, /, ``);
    };

    this.statement = `SELECT * FROM ${this._table}
    ${this._joins.length ? ` ${generateJoinStatment(this._joins)}` : ``}
    ${ this._wheres.length ? ` WHERE ${generateWhereStatement(this._wheres)}` : ``}
    ${ this._orderBys.length ? ` ORDER BY ${generateOrderByStatement(this._orderBys)}` : ``}
    ${ this._limit.to ? ` LIMIT ${this._limit.from}, ${this._limit.to}` : ``}
    `;
  }

  public get() {

  }
  public first() {

  }
}