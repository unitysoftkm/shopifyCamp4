/** @typedef {import("@remix-run/node").ActionArgs} ActionArgs */

import { json, } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, useSubmit, } from "@remix-run/react";
import { authenticate } from "../shopify.server";
import { TextField, Page, Layout, Card, Text, PageActions } from "@shopify/polaris";
import { useState } from "react";

export async function loader({ request, params }) {
  const { admin } = await authenticate.admin(request);
  const id = params.id;
  const response = await admin.graphql(
    `
        query selectCustomer($id: ID!){
            customer(id: $id) {
            id
            firstName
            }
        }`
    ,
    {
      variables: {
        "id": "gid://shopify/Customer/" + params.id,
      },
    }
  );

  const responseJson = await response.json();
  return json({
    customer: responseJson.data.customer,
  });
}

export
  /**
    * @param {request} ActionArgs
    * @returns {FunctionResult}
  */
  async function action({ request, params }) {
  const body = await request.formData();

  const newFirstName = body.get("newFirstName");
  const oldFirstName = body.get("oldFirstName");

  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `
    mutation customerUpdate($input: CustomerInput!) {
      customerUpdate(input: $input) {
        userErrors {
          field
          message
        }
        customer {
          id
          firstName
        }
      }
    }`
    ,
    {
      variables: {
        input: {
          "id": "gid://shopify/Customer/" + params.id,
          "firstName": newFirstName,
        },
      },
    }
  );

  const responseJson = await response.json();
  return json({
    customer: responseJson.data.customerUpdate,
    message: `更新が完了しました。 新顧客名：${newFirstName}  旧顧客名：${oldFirstName}`


  });
}



export default function main() {
  const actionData = /** @type {action} */ useActionData();
  const loaderData = useLoaderData();
  const submit = useSubmit();

  const data = {
    newFirstName: ""
    ,oldFirstName: ""
  }

  const [formState, setFormState] = useState(data);
  const [cleanFormState, setCleanFormState] = useState(data);
  const nav = useNavigation();
  const isSaving = nav.state === "submitting" && nav.formMethod === "POST";
  const isDirty = JSON.stringify(formState) !== JSON.stringify(cleanFormState);
  function handleSave() {
    const data = {
      newFirstName: formState.newFirstName,
      oldFirstName: formState.oldFirstName,
    };

    setCleanFormState({ ...formState });
    submit(data, { method: "post" });
  }

  return (
    <Page>
      <ui-title-bar title="顧客名変更画面" />
      <Layout>
        <Layout.Section>
          <Card>
          <Text as="h2" variant="bodyMd" color="success" >
            {actionData ? actionData.message : ""}
          </Text>
            <Text as="h2" variant="bodyMd" >
              現顧客名：{loaderData ? loaderData.customer.firstName : "なし"}
            </Text>
            <TextField
              id="oldFirstName"
              label="新顧客名"
              helpText="新しい顧客名を入力してください"
              autoComplete="off"
              value={loaderData ? formState.newFirstName : ""}
              onChange={(newFirstName,) =>
                setFormState({ ...formState, newFirstName: newFirstName, oldFirstName:loaderData.customer.firstName })
              }
            />
            <PageActions
              primaryAction={{
                content: "変更する",
                loading: isSaving,
                disabled: !isDirty || isSaving,
                onAction: handleSave,
              }}
            />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}