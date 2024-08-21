import {
    Page, Frame,
    Layout, Text, Card, ActionList, Button, InlineGrid,
    Link, InlineStack, Box, Tabs, TextField, Bleed, Divider,
    Icon, BlockStack, LegacyCard, TextContainer,
    SkeletonDisplayText, SkeletonBodyText, SkeletonPage, Toast

} from "@shopify/polaris";
import { useTranslation, Trans } from "react-i18next";
import {React, useCallback,useContext, useEffect, useState} from "react";
import {
    CheckIcon,FlagIcon,QuestionCircleIcon
} from '@shopify/polaris-icons';
import { useNavigate } from 'react-router-dom';
import { getSessionToken } from "@shopify/app-bridge-utils";
import { useAppBridge } from "@shopify/app-bridge-react"
import axios from "axios";
import {AppContext} from "../components/index.js";

export default function Support() {
    const { t } = useTranslation();
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const handleTabChange = useCallback((selectedTabIndex) => setSelected(selectedTabIndex), []);
    const tabs = [
        {
            id: 'send-message',
            content: 'Send a message',
            panelID: 'send-message-content',
        },
        {
            id: 'send-email',
            content: 'Send an email',
            panelID: 'send-email-content',
        }
    ];
    const [messageError, setMessageError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [successToast, setSuccessToast] = useState(false);
    const [toastMsg, setToastMsg] = useState("");
    const toggleSuccessMsgActive = useCallback(
        () => setSuccessToast((successToast) => !successToast),
        []
    );
    const toastSuccessMsg = successToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;
    const handleMessageChange = useCallback(
        (newValue) => setMessage(newValue)
    );
    const handleEmailChange = useCallback(
        (newValue) => setEmail(newValue)
    );
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };
    const handleSubmit = async ()=>{

        try {
            setMessageError('');
            setEmailError("");

            // Basic validation
            let hasError = false;
            if (!message.trim()) {
                setMessageError('Message is required.');
                hasError = true;
            }
            if (!email.trim()) {
                setEmailError('Email is required.');
                hasError = true;
            } else if (!isValidEmail(email)) {
                setEmailError('Please enter a valid email address.');
                hasError = true;
            }

            if (hasError) {
                return; // Stop further execution if there are validation errors
            }
            setBtnLoading(true);
            const sessionToken = await getSessionToken(appBridge);
            const tokenSegments = sessionToken.split(".");

            if (tokenSegments.length !== 3) {
                setBtnLoading(false);
                throw new Error("Invalid JWT token");
            }
            const headers = {
                Authorization: `Bearer ${sessionToken}`,
            };
            const formData = new FormData();
            formData.append('message', message);
            formData.append('email', email);
            const response = await axios.post(`${apiUrl}send-message`, formData,{
                headers,
            });

            if (response) {
                setMessage('');
                setBtnLoading(false);
                setSuccessToast(true);
                setToastMsg('Message send Successfully');

            } else {
                console.error("No search behaviour data found");
                setBtnLoading(false);
            }



        } catch (error) {
            console.error("Error loading fields:", error);
            setBtnLoading(false);

        }
    };

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
            const response = await axios.get(`${apiUrl}email`, {
                headers,
            });



            if (response?.status === 200) {
                setEmail(response?.data.email||"");

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
    const SkeltonPage = () => {
        return (
            <SkeletonPage fullWidth>
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
        <Frame>
      <Page title=""
            >
        <Box>
            {loading ? <SkeltonPage/> :
                <>
                    <Layout >
                        <Layout.Section>
                            <Text variant="headingLg" as="h3">
                                How can we help you?
                            </Text>
                        </Layout.Section>
                    </Layout>
                    <br/>
                    <Layout >
                        <Layout.Section >
                            <Card padding={0}>
                                <Box padding={400}>
                                <Text variant="headingMd" as="h3">
                                    Contact us
                                </Text>
                                <Text variant="bodyMd" as="p">
                                    Questions or comments? We'd love to hear from you!
                                </Text>
                                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted />
                                    <Divider/>
                                    <br/>
                                {selected==0?<BlockStack gap="300">

                                    <TextField
                                        label="Your message"
                                        value={message}
                                        onChange={handleMessageChange}
                                        multiline={10}
                                        autoComplete="off"
                                        error={!!messageError}
                                        helpText={messageError}
                                    />
                                    <TextField

                                        label="Your email address (for our reply)"
                                        value={email}
                                        onChange={handleEmailChange}
                                        type="email"
                                        autoComplete="email"
                                        error={!!emailError}
                                        helpText={emailError || "We'll send our response to this address."}
                                        // helpText=""
                                    />
                                    <InlineStack align={"end"}>
                                        <Button variant={"primary"} loading={btnLoading} onClick={handleSubmit}>Send message</Button>
                                    </InlineStack>
                                </BlockStack>:<BlockStack gap="300">

                                    <Text variant="bodyMd" as="p">
                                        Prefer email, or need to attach something?
                                    </Text>
                                    <Text variant="bodyMd" as="p">
                                        You can contact us directly at <Link url="mailto:help@cartquant.com" >help@cartquant.com</Link>
                                    </Text>
                                    <InlineStack align={"start"}>
                                        <Link url="mailto:help@cartquant.com" >
                                        <Button variant={"primary"}>Send us an email</Button>
                                        </Link>
                                    </InlineStack>

                                </BlockStack>}
                                </Box>
                                <Divider/>
                                <Bleed >
                                    <Box
                                        background="bg-surface-secondary"
                                        padding={400}
                                    >
                                        <Text as="h3" variant="headingSm" fontWeight="medium">
                                            We'll get back to you as soon as we can!
                                        </Text>
                                    </Box>
                                </Bleed>
                            </Card>

                        </Layout.Section>

                    </Layout>
            </>
            }
            <br/>
        </Box>
          {toastSuccessMsg}
      </Page>
        </Frame>
    );
  }
