export const mdxTemplate = `
import { --component_fc_name-- } from "./--component_file_name--";
import { Canvas, Meta, Story } from "@storybook/addon-docs";

<Meta title="components/--story_name--" component={--component_fc_name--} />

export const Template = () => <--component_fc_name-- />;

# **--component_name--**

The \`--component_name--\` component is imported from \`RadixUI\`, you can find more information about the component [HERE](--component_doc_url--).

<Canvas>
  <Story
    name="neutral"
    args={{
      status: "neutral",
      label: "Neutral",
    }}
  >
    {Template.bind({})}
  </Story>
</Canvas>

Here's an example of the **--component_name--** component:

\`\`\`jsx
// --component_name-- code block example
--example_code--
\`\`\`

`