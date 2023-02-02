import JSZip from 'jszip'
import { saveAs } from 'file-saver';
import { mdxTemplate } from './mdxTemplate'

interface ComponentObj {
  name: string,
  code: string
}


const componentElements = Array.from(document.querySelectorAll('a[href^="/docs/primitives/components/"]')).slice(0, 27) as HTMLAnchorElement[]

const zip = new JSZip()

const requiredDependencies: string[] = []

const promises = componentElements.map(c => (
  fetch(c.href)
    .then(r => r.text())
    .then(htmlData => {
      const parser = new DOMParser()
      const parsedPage = parser.parseFromString(htmlData, 'text/html')
      const obj: ComponentObj =  {
        name: parsedPage.title.split(' – ')[0],
        code: parsedPage.querySelector('code')!.textContent as string
      }
      zipComponentObj(zip, obj)
    }))
)

Promise.all(promises).then(() => {
  const requiredDependenciesFileContent = 'npm i ' + requiredDependencies.join(' ')
  zip.file('required-dependencies.txt', requiredDependenciesFileContent)
  zip.generateAsync({type: 'blob'})
    .then(content => saveAs(content, 'result.zip'))
  })


function zipComponentObj(zipObj: JSZip, { name, code }: ComponentObj) {

  const componentSlugName = name.toLowerCase().replaceAll(' ', '-')
  const componentFcName = name.replaceAll(' ', '') + 'Demo'
  const camelName = name.replaceAll(' ', '')

  const folder = zipObj.folder(componentSlugName)
  const inedxFileContent = code.split(/\n/)[1].replace(/^import/, 'export').replace(/(?<=\sas\s)\w+(?=\sfrom)/, 'default')
  
  requiredDependencies.push(inedxFileContent.match(/(?<=').*(?=')/)![0])

  const patternForImport = new RegExp(`import.*(${camelName}).*(?=\n+)`)
  const patterToRemoveDefaultExport = new RegExp(`export default ${componentFcName};`)

  const cleanCode =
    code
      .replace("import './styles.css';", '')
      .replace(patternForImport, "import $1 from './index';")
      .replace(/const\s\w+Demo/, 'export $&')
      .replace(patterToRemoveDefaultExport, '')
      .trim()

  const mdxContent = 
    mdxTemplate
      .replaceAll('--component_fc_name--', componentFcName)
      .replaceAll('--story_name--', camelName)
      .replaceAll('--component_file_name--', componentSlugName)
      .replaceAll('--component_name--', name)
      .replaceAll('--component_doc_url--', `https://www.radix-ui.com/docs/primitives/components/${componentSlugName}`)
      .replaceAll('--example_code--', cleanCode)
      .trim()
  
  folder?.file('index.ts', inedxFileContent)
  folder?.file(componentSlugName + '.example.tsx', cleanCode)
  folder?.file(componentSlugName + '.stories.mdx', mdxContent)
}

