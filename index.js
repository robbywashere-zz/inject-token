const url = require('url')
const fs = require('fs')
const path = require('path')

function addAuthToken(dirname = process.argv[2]) {

  const pkgPath = path.join(dirname,'./package.json')

  const GH_TOKEN = "this-is-an-auth-token-123" //process.env.GH_TOKEN

  if (typeof process.env.NODE_ENV === "production" && typeof GH_TOKEN === "undefined") {
    throw new Error(`Github Auth Injector: env var GH_TOKEN must be defined in production environment!`)
  }

  if (!fs.existsSync(pkgPath)) {
    console.error(`Github Auth Injector: ${pkgPath} does not exist!`)
    process.exit(1)
  }

  try {
    var pkgJson = JSON.parse(fs.readFileSync(pkgPath,'utf-8'))
  } catch(e) {
    console.error(`Github Auth Injector: Error parsing package.json`)
    throw new Error(e)
  }

  let deps = pkgJson.dependencies
  let newDeps = {}

  for (let key in deps) {
    let depUrl = deps[key]
    let parsedUrl = url.parse(depUrl)

    if (parsedUrl.protocol && 
      parsedUrl.hostname === "github.com" &&
        parsedUrl.hash){
          parsedUrl.auth = `${GH_TOKEN}:x-oauth-basic`
          newDeps[key] = parsedUrl.format()
        }
  }

  if (Object.keys(newDeps).length > 0) {
    Object.assign(pkgJson.dependencies, newDeps) 
    console.error(`Modifying dependencies to ${Object.keys(newDeps).join(',')}`)
    console.error(pkgJson.dependencies)
    fs.writeFileSync(pkgPath,JSON.stringify(pkgJson,null,"\t"),'utf-8')
  } else {
    console.error(`Github Auth Injector: no github modules found in ${pkgPath} ... skipping`)
  }

}

if (require.main === module) {
  addAuthToken()
}

module.exports = { addAuthToken }




