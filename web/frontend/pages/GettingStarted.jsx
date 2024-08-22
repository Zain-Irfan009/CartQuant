import {
    Page,
    Layout, Text, Card, ActionList, Button, InlineGrid, Link, InlineStack,Box,
    Icon, BlockStack, LegacyCard, TextContainer, SkeletonDisplayText, SkeletonBodyText,SkeletonPage

} from "@shopify/polaris";
  import { useTranslation, Trans } from "react-i18next";
import {React, useContext, useEffect, useState} from "react";
import {
    CheckIcon,FlagIcon,QuestionCircleIcon,ExternalSmallIcon
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react"
import axios from "axios";
import {AppContext} from "../components";
export default function GettingStarted() {
    const { t } = useTranslation();
    const { apiUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [extensionEnable, setExtensionEnable] = useState(false);
    const [passwordProtected, setPasswordProtected] = useState(false);
    const [linkUrl, setLinkUrl] = useState(null);
    const [passwordlinkUrl, setPasswordLinkUrl] = useState(null);
    const [rule, setRule] = useState(false);
    const [allRuleActive, setAllRuleActive] = useState(false);
    const appBridge = useAppBridge();
    const fetchData = async () => {
        try {
            setLoading(true);
            const sessionToken = await getSessionToken(appBridge);
            const tokenSegments = sessionToken.split(".");

            if (tokenSegments.length !== 3) {
                setLoading(false);
                throw new Error("Invalid JWT token");
            }
            const headers = {
                Authorization: `Bearer ${sessionToken}`,
            };
            const response = await axios.get(`${apiUrl}installation`, {
                headers,
            });


            if (response?.status === 200) {
                setExtensionEnable(response?.data.app_status );
                setPasswordProtected(response?.data.password_protected );
                setLinkUrl(response?.data?.customizer_link)
                setPasswordLinkUrl(response?.data?.password_link)
                setRule(response?.data.rule_found);
                if(response?.data.rule_found) {
                    setAllRuleActive(response?.data.all_rules_active);
                }

            } else {
                console.error("No search behaviour data found");
            }
            setLoading(false);


        } catch (error) {
            console.error("Error loading fields:", error);
            setLoading(false);

        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleButtonClick = () => {
        if (linkUrl) {
            window.open(linkUrl, '_blank');
        }
    };


    const handlePasswordButtonClick = () => {
        if (passwordlinkUrl) {
            window.open(passwordlinkUrl, '_blank');
        }
    };
    const SkeltonPage = () => {
        return (
            <SkeletonPage >
            <Layout >
                <Layout.Section variant={"fullWidth"} >
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>
                    <LegacyCard sectioned>
                        <TextContainer>
                            <SkeletonDisplayText size="small" />
                            <SkeletonBodyText />
                        </TextContainer>
                    </LegacyCard>
                </Layout.Section>
            </Layout>
            </SkeletonPage>
        )
    }
    return (
      <Page title=""
            >
          <Box>
              {loading ? <SkeltonPage/> :
    <>
        <Layout>
            <Layout.Section>
                <Text variant="headingLg" as="h3">
                    Welcome to CartQuant!
                </Text>
                <Text variant="bodyMd" as="p">
                    We're glad you're here! Follow the quick steps below to set up
                    your CartQuant. You'll be up and running in no time!
                </Text>
            </Layout.Section>

        </Layout>
          <br/>
        <Layout >
            <Layout.Section >
                {passwordProtected &&
                <Card >
                        <InlineGrid gap="100" columns={['twoThirds', 'oneThird']}>
                            <InlineStack align="start" blockAlign="center">
                                <div className={`stepIcon ${!passwordProtected ? 'active' : ''}`}>
                                    {!passwordProtected ? (
                                        <Icon source={CheckIcon} tone="success" />
                                    ) : (
                                        <span>1</span>
                                    )}
                                </div>

                                <div>
                                    <Text variant="headingMd" as="h3">
                                        Your Store is Password Protected
                                    </Text>
                                    <Text variant="bodyMd" as="p">
                                        Please disable the password by clicking the button
                                    </Text>
                                    {/*<Text variant="bodyMd" as="p">*/}
                                    {/*    extension from customizer*/}
                                    {/*</Text>*/}
                                    {/* <Link url="https://help.shopify.com/manual" external>
                    link to the page from your site's menu
                </Link> */}
                                </div>
                            </InlineStack>

                            <InlineStack align="end" blockAlign="center">
                                <Button variant="primary" onClick={handlePasswordButtonClick} size="slim">
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  Disable Password
                    <Icon source={ExternalSmallIcon} tone="base" />
                </span>
                                </Button>
                            </InlineStack>
                        </InlineGrid>
                </Card>
                }
                    <br/>
                <Card >
                <InlineGrid gap="100" columns={['twoThirds', 'oneThird']}>
                    <InlineStack align="start" blockAlign="center">
                        <div className={`stepIcon ${extensionEnable ? 'active' : ''}`}>
                            {extensionEnable ? (
                                <Icon source={CheckIcon} tone="success" />
                            ) : (
                                <span>{passwordProtected ?2:1}</span>
                            )}
                        </div>

                        <div>
                            <Text variant="headingMd" as="h3">
                                Enable your theme block from customizer
                            </Text>
                            <Text variant="bodyMd" as="p">
                                On Click on the button, you can enable theme
                            </Text>
                            <Text variant="bodyMd" as="p">
                                extension from customizer
                            </Text>
                            {/* <Link url="https://help.shopify.com/manual" external>
                    link to the page from your site's menu
                </Link> */}
                        </div>
                    </InlineStack>

                    <InlineStack align="end" blockAlign="center">
                        <Button variant="primary" onClick={handleButtonClick} size="slim">
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    Enable Extension
                    <Icon source={ExternalSmallIcon} tone="base" />
                </span>
                        </Button>
                    </InlineStack>
                </InlineGrid>
                </Card>
                <br/>
                <Card >
                    <InlineGrid gap="100" columns={[ 'twoThirds', 'oneThird']} >
                        <InlineStack  align="start" blockAlign={"center"} >
                            <div className={`stepIcon ${rule ? 'active' : ''}`}>
                                {rule ? (
                                    <Icon source={CheckIcon} tone="success" />
                                ) : (
                                    <span>{passwordProtected ?3:2}</span>
                                )}
                            </div>

                            <div>
                                <Text variant="headingMd" as="h3">
                                    Create Rule
                                </Text>
                                <Text variant="bodyMd" as="p">
                                  You can create rule of any type like product,
                                </Text>
                                <Text variant="bodyMd" as="p">
                                   vendor,tags and type.
                                </Text>

                            </div>
                        </InlineStack>


                        <InlineStack align="end" blockAlign={"center"}>

                            <Button variant="primary"  size={"slim"}  onClick={() => navigate('/rules/CreateRule')}>Create Rule</Button>
                        </InlineStack>
                    </InlineGrid>
                </Card>
                <br/>
                <Card >
                    <InlineGrid gap="100" columns={[ 'twoThirds', 'oneThird']} >
                        <InlineStack  align="start" blockAlign={"center"} >
                            <div className={`stepIcon ${allRuleActive ? 'active' : ''}`}>
                                {allRuleActive ? (
                                    <Icon source={CheckIcon} tone="success" />
                                ) : (
                                    <span>{passwordProtected ?4:3}</span>
                                )}
                            </div>

                            <div>
                                <Text variant="headingMd" as="h3">
                                    You will need to enable Rule
                                </Text>
                                <Text variant="bodyMd" as="p">
                                    The rule you created needs to be activated
                                </Text>
                                <Text variant="bodyMd" as="p">
                                    in order to work.
                                </Text>

                            </div>
                        </InlineStack>


                        <InlineStack align="end" blockAlign={"center"}>

                            <Button variant="primary"  size={"slim"} onClick={() => navigate('/')}>Activate Rule</Button>
                        </InlineStack>
                    </InlineGrid>
                </Card>
            </Layout.Section>
            <Layout.Section  variant={"oneThird"}>
                <Card >
                    <BlockStack gap="300">
                        <Text variant="headingMd" as="h3">
                            Need some help?
                        </Text>
                        <BlockStack gap="300">
                            <div>
                                <Text variant="bodyMd" as="p">
                                    Just  <Link onClick={() => navigate('/support')}>send us a quick message</Link> and we're happy to answer any questions!
                                </Text>

                            </div>

                        </BlockStack>
                    </BlockStack>
                </Card>
            </Layout.Section>
        </Layout>
          <br/>
          <br/>
    </>
              }
          </Box>
      </Page>
    );
  }
