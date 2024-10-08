import TasklistPage from '../../tasklistPage'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: Array<any>) => object

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
interface Type<T> extends Function {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  new (...args: Array<any>): T
}

const Task = (options: { name: string; actionText?: string; slug: string; pages: Array<Type<TasklistPage>> }) => {
  return <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata('task:slug', options.slug, constructor)
    Reflect.defineMetadata('task:name', options.name, constructor)
    Reflect.defineMetadata('task:actionText', options.actionText || options.name, constructor)
    Reflect.defineMetadata('task:pages', options.pages, constructor)
    options.pages.forEach(page => {
      Reflect.defineMetadata('page:task', options.slug, page)
    })
  }
}

export default Task
