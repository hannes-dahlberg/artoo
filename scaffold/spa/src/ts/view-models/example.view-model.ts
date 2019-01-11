import { ViewModel } from "./view-model";
import { ExampleDTO } from "../../../../shared/dto";

export interface IExampleViewModel {
  id: number;
  foo?: IExampleViewModel;
  bar?: IExampleViewModel[]
}

export class ExampleViewModel extends ViewModel<IExampleViewModel> implements IExampleViewModel {
  public id: number;
  public foo: IExampleViewModel;
  public bar?: IExampleViewModel[];

  public static fromExampleDTO(example: ExampleDTO) {
    return new ExampleViewModel({
      id: example.id,
      ...(example.foo ? { foo: ExampleViewModel.fromExampleDTO(example.foo) } : null),
      ...(example.bar ? { bar: example.bar.map((bar: ExampleDTO) => ExampleViewModel.fromExampleDTO(bar)) } : null)
    });
  }
}