export interface Manager {
  emit(event: any, ...args: any[]): Promise<void>
}
