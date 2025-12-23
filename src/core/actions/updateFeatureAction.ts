import { BlockLayer, GroundLayer, WallsLayer } from '../layers'
import { EditAction } from '../manager/UndoRedoManager'

export class UpdateFeatureAction implements EditAction {
  constructor(private layer: WallsLayer | GroundLayer | BlockLayer, private feature: any) {}
  apply() {}
  undo() {}
}
