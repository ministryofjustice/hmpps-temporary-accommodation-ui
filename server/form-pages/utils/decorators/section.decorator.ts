import 'reflect-metadata'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: Array<any>) => object

const Section = (options: { title: string; tasks: Array<Constructor> }) => {
  return <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata('section:title', options.title, constructor)
    Reflect.defineMetadata('section:name', constructor.name, constructor)
    Reflect.defineMetadata('section:tasks', options.tasks, constructor)
  }
}

export default Section
