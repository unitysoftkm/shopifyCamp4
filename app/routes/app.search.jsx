/** @typedef {import("@remix-run/node").ActionArgs} ActionArgs */

import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { Card, Layout, IndexTable, Text, TextField, VerticalStack, Divider, Page, PageActions } from "@shopify/polaris";
import { useState } from "react";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `
      query {
        customers(first:10) {
          edges{
            node{
          id
          firstName
            }
          }
        }
      }`
  );

  const responseJson = await response.json();
  return json({
    customers: responseJson.data.customers.edges,
  });
}

export
  /**
    * @param {request} ActionArgs
    * @returns {FunctionResult}
  */
  async function action({ request }) {
  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  return redirect("/app/nameChange/" + data.customerId);

}


export default function main() {
  const loaderData = useLoaderData();
  const submit = useSubmit();

  const data = {
    customerId: ""
  }

  const [formState, setFormState] = useState(data);
  const [cleanFormState, setCleanFormState] = useState(data);
  const nav = useNavigation();
  const isSaving = nav.state === "submitting" && nav.formMethod === "POST";
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  function handleSave() {
    const data = {
      customerId: formState.customerId,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title="顧客ID選択画面" />
      <Layout>
        <Layout.Section>
          <Card>
            <Text as={"h2"} variant="headingLg">
              顧客ID
            </Text>
            <TextField
              id="customerId"
              label="顧客ID"
              helpText="顧客IDを入力してください"
              labelHidden
              autoComplete="off"
              value={formState.customerId}
              onChange={(customerId) =>
                setFormState({ ...formState, customerId: customerId })
              }
            />
            <PageActions
              primaryAction={{
                content: "選択する",
                loading: isSaving,
                disabled: !isDirty || isSaving,
                onAction: handleSave,
              }}
            />

            <Text variant="heading2xl" as="h3">
              顧客一覧
            </Text>
            <VerticalStack gap="5">
              <Divider borderColor="border-inverse" />
              <Divider borderColor="transparent" />
            </VerticalStack>
            <IndexTable
              itemCount={loaderData.customers.length}
              headings={[
                { title: "id" },
                { title: "firstName" },
              ]}
              selectable={false}
            >
              {loaderData.customers.map(
                ({
                  node,
                }) => {
                  return (
                    <IndexTable.Row id={node} key={node} position={node}>
                      <IndexTable.Cell>{node.id}</IndexTable.Cell>
                      <IndexTable.Cell>{node.firstName}</IndexTable.Cell>
                    </IndexTable.Row>
                  );
                }
              )}
            </IndexTable>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
