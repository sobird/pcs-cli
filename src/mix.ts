import { readFileSync } from 'fs'
import { Command } from 'commander'

console.log('Command', Command)
console.log('readFileSync', readFileSync)


const fn = () => {
  return 123
}
