import 'reflect-metadata'

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor = new (...args: Array<any>) => {}

const Section = (options: { title: string; tasks: Array<Constructor> }) => {
  return <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata('section:title', options.title, constructor)
    Reflect.defineMetadata('section:name', constructor.name, constructor)
    Reflect.defineMetadata('section:tasks', options.tasks, constructor)
  }
}

export default Section
