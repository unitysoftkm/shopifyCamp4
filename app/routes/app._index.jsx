import { useEffect } from "react";
import { json, redirect } from "@remix-run/node";
import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  VerticalStack,
  Card,
  Button,
  HorizontalStack,
  Box,
  Divider,
  List,
  Link,
  PageActions,
} from "@shopify/polaris";

import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  return json({ shop: session.shop.replace(".myshopify.com", "") });
};


export
  /**
    * @param {request} ActionArgs
    * @returns {FunctionResult}
  */
  async function action({ request }) {
  /** @type {any} */

  return redirect("/app/search/");

}

export default function Index() {
  const submit = useSubmit();
  function handleSave() {
    submit({}, { replace: true, method: "POST" });
  };

  return (
    <Page>
      <ui-title-bar title="初めに">
      </ui-title-bar>
      <VerticalStack gap="5">
        <Layout>
          <Layout.Section>
            <Card>
              <VerticalStack gap="5">
                <Text as="p" variant="headingMd" color="critical">
                  ※成果物4顧客名変更アプリ では顧客情報の姓名のデータの読み書きを行うため、
                  <br />
                  アプリ管理画面から「 顧客データへのアクセス許可」の設定が必要です。
                </Text>
                <Text as="p" variant="bodySm" >
                  「アプリ管理」→「アプリ名」→「APIアクセス」→
                  アクセス要求 保護された顧客データへのアクセス「アクセス権をリクエスト」or「管理」→
                  <br />
                  保護された顧客データ「選択」→理由を選択して「保存」→
                  保護されたお客様フィールド (任意) 名前「選択」→理由を選択して「保存」
                </Text>
              </VerticalStack>
              <PageActions
                primaryAction={{
                  content: " 成果物4 顧客名変更アプリ",
                  onAction: handleSave
                }} />
            </Card>
          </Layout.Section>
        </Layout>
      </VerticalStack>
    </Page>
  );
}
