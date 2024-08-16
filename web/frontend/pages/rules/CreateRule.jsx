import {
    Card,
    Page,
    Layout,
    TextContainer,
    IndexTable,
    useIndexResourceState,
    Image,
    Tag,
    BlockStack,
    Pagination,
    Form,
    Checkbox,
    Thumbnail,
    Link,
    Box,
    EmptySearchResult,
    Toast,
    FormLayout,
    SkeletonBodyText,
    PageActions,
    TextField,
    Spinner,
    Frame,
    Tooltip,
    Button,
    Tabs,
    Modal,
    Loading,
    LegacyCard,
    Icon,
    Badge,
    Text,
    ChoiceList,
    Divider,
    InlineStack,
    Scrollable,
    Select
} from "@shopify/polaris";
import {
    SearchMinor,
    SearchMajor,
    ExternalMinor,
    PlusMinor,
    DeleteMinor,
    HorizontalDotsMinor,
    ViewMajor
} from "@shopify/polaris-icons";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { TitleBar } from "@shopify/app-bridge-react";

import { trophyImage } from "../../assets/index.js";
import {  InputField } from '../../components/Utils/InputField.jsx'

import axios from "axios";
import { useAppBridge, } from "@shopify/app-bridge-react";
import { AppContext } from "../../components/providers/ContextProvider.jsx";
import { getSessionToken } from "@shopify/app-bridge-utils";
import ReactSelect from 'react-select';

import "../../index.css";


import {useLocation, useNavigate} from "react-router-dom";

export default function CreateRule() {

    const appBridge = useAppBridge();

    const navigate = useNavigate();
    const location = useLocation();
    const { apiUrl } = useContext(AppContext);
    const [btnLoading, setBtnLoading] = useState(false)
    const [toggleLoadData, setToggleLoadData] = useState(false);
    const [loading, setLoading] = useState(false)
    const [discountError, setDiscountError] = useState()
    const [errorToast, setErrorToast] = useState(false);
    const [sucessToast, setSucessToast] = useState(false);
    const [toastMsg, setToastMsg] = useState('')
    const [discardModal, setDiscardModal] = useState(false)

    const [skeleton, setSkeleton] = useState(false)
    const [productsList, setProductsList] = useState([]);
    const [productsListFilter, setProductsListFilter] = useState([]);
    const handleTextFieldChange = useCallback((value) => {
        setTextFieldValue(value);
        setToggleLoadData(true);
        setProductsLoading(true);
    }, []);


    const [textFieldValue, setTextFieldValue] = useState("");

    const [selectedProducts, setSelectedProducts] =
        useState([]);

    // =================Products Modal Code Start Here================
    const [productsLoading, setProductsLoading] = useState(false)
    const [queryValue, setQueryValue] = useState('');
    const [toggleLoadProducts, setToggleLoadProducts] = useState(true)

    const [allProducts, setAllProducts] = useState([])
    const [hasNextPage, setHasNextPage] = useState(false)
    const [nextPageCursor, setNextPageCursor] = useState('')
    const [selectedVariantProducts, setSelectedVariantProducts] = useState([])
    const [checkedVariants, setCheckedVariants] = useState([])
    const [previousCheckedVariants, setPreviousCheckedVariants] = useState([])
    const [ruleType, setRuleType] = useState('product');
    const [pendingType, setPendingType] = useState("");
    const [newType, setNewType] = useState([]);
    const [titleError, setTitleError] = useState(false);
    const [ruleName, setRuleName] = useState('')



    const addNewTrackingNumber = (trackingNumber) => {
        const trackingNumberSet = new Set(newType);
        const newTrackingNumberArray = [...trackingNumberSet.add(trackingNumber)];
        setNewType(newTrackingNumberArray);
        setPendingType("");
    };
    const handleKeyPress = (event) => {
        const enterKeyPressed = event.keyCode === 13;
        if (enterKeyPressed) {
            event.preventDefault();
            addNewTrackingNumber(pendingType);
        }
    };

    const handleChange = (value) => {
        const trimmedValue = value.trim();

        if (trimmedValue !== "") {
            const lastChar = value.charAt(value.length - 1);

            if (lastChar === "," || lastChar === " ") {
                return addNewTrackingNumber(value.slice(0, -1));
            }

            setPendingType(value);
        }

    };


    const handleBlur = () => {
        if (pendingType.trim() !== "") {
            // Here, you can add any functionality you want to perform
            // when the input field loses focus with a non-empty value.
            addNewTrackingNumber(pendingType);
        }
    };


    const removeTrackingNumber = useCallback(
        (tag) => () => {
            setNewType((previousTags) =>
                previousTags.filter((previousTag) => previousTag !== tag)
            );
        },
        []
    );
    let trackingNumberToAddMarkup = null;

    if (newType.length > 0) {
        const tagsToAdd = newType.map((tag) => (
            <Tag key={tag} onRemove={removeTrackingNumber(tag)}>
                {tag}
            </Tag>
        ));
        trackingNumberToAddMarkup = <div className="mt-2"> <InlineStack  gap="500">{tagsToAdd}</InlineStack> </div>;
    }


    const [
        toolsAndAccessoriesProductModal,
        setToolsAndAccessoriesProductModal,
    ] = useState(false);

    const handleProductTabChange = useCallback(
        (selectedTabIndex) => setProductTab(selectedTabIndex),
        [],
    );

    const handleRemoveToolsAndAccessories = (productId) => {
        const newArray = selectedToolsAndAccessories.filter(
            (product) => product.id !== productId
        );
        const newIdsArray = selectedToolsAndAccessoriesIDs.filter(
            (id) => id !== productId
        );
        setSelectedToolsAndAccessoriesIDs(newIdsArray);
        setSelectedToolsAndAccessories(newArray);
    };

    const handleCloseToolsAndAccessoriesModal = useCallback(() => {
        setToolsAndAccessoriesProductModal(false);
        setToggleLoadData(false);
    }, [toolsAndAccessoriesProductModal]);

    const [selectedToolsAndAccessoriesIDs, setSelectedToolsAndAccessoriesIDs] =
        useState([]);

    const [selectedToolsAndAccessories, setSelectedToolsAndAccessories] =
        useState([]);
    const handleToolsAndAccessoriesSaveModal = () => {
        setToolsAndAccessoriesProductModal(false);
        const selectedProd = productsList?.filter((product) =>
            selectedToolsAndAccessoriesIDs.includes(product.id)
        );
        setSelectedToolsAndAccessories(selectedProd);
    };

    const handleDiscardModal = () => {
        setDiscardModal(!discardModal)
    }

    const discardAddSeller = () => {
        navigate('/sellerslisting')
    }
    const handleProductsSaveModal = () => {
        setProductsModal(false)
        setPreviousCheckedVariants(checkedVariants)
    }
    const handleOpenToolsAndAccessoriesModal = useCallback(() => {
        setToolsAndAccessoriesProductModal(true);
        setToggleLoadData(true);
        setProductsLoading(true);
    }, [toolsAndAccessoriesProductModal]);




    const handleSave = async () => {
        let sessionToken = await getSessionToken(appBridge);
        if (ruleName.trim() === "") {
            setTitleError(true);
            return;
        }

     setBtnLoading(true)


        try {
            const data = {
                name: ruleName,
                product_data: selectedToolsAndAccessories,
                product_ids: selectedToolsAndAccessoriesIDs,
                type:ruleType,
                type_values:newType

            };

            const response = await axios.post(`${apiUrl}save-rule`, data, {
                headers: {
                    Authorization: `Bearer ${sessionToken}`,
                    "Content-Type": "multipart/form-data",
                },
            });
            setSucessToast(true);
            setToastMsg(response?.data?.message);
            setBtnLoading(false);
            setTimeout(() => {
                navigate("/");
            }, 500);
        } catch (error) {

            setToastMsg(response?.data?.message);
            setErrorToast(true)
            setBtnLoading(false);
        }
    };





    const fetchData = async () => {
        let sessionToken = await getSessionToken(appBridge);
        try {
            const response = await axios.get(
                `${apiUrl}products?search=${textFieldValue}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );


            if (response?.status == 200) {
                if (textFieldValue == "") {
                    setProductsList(response?.data?.data?.body?.products);
                    setProductsListFilter(response?.data?.data?.body?.products);
                } else {
                    setProductsListFilter(response?.data?.data?.body?.products);
                }
                setToggleLoadData(false);
                setProductsLoading(false);
            }
        } catch (error) {
            setProductsLoading(false);
        } finally {
            setProductsLoading(false);
        }
    };

    useEffect(() => {
        if (toggleLoadData) {
            fetchData();
        }
    }, [toggleLoadData, textFieldValue]);

    const handleProductsPagination = () => {
        if (hasNextPage) {
            setProductsLoading(true);
            setToggleLoadProducts(true)
        }
    };





    const handleQueryChange = (query) => {
        setQueryValue(query);

        setProductsLoading(true)
        setNextPageCursor('')
        setAllProducts([])
        setTimeout(() => {
            setToggleLoadProducts(true)
        }, 500);


    };




    // =================Collections Modal Code Ends Here================



    // ------------------------Toasts Code start here------------------
    const toggleErrorMsgActive = useCallback(() => setErrorToast((errorToast) => !errorToast), []);
    const toggleSuccessMsgActive = useCallback(() => setSucessToast((sucessToast) => !sucessToast), []);

    const toastErrorMsg = errorToast ? (
        <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
    ) : null;

    const toastSuccessMsg = sucessToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;



    const handleToolsAndAccessoriesSelect = (id) => {
        // If the selected product is already in the list, remove it
        if (selectedToolsAndAccessoriesIDs.includes(id)) {
            const newArray = selectedToolsAndAccessoriesIDs.filter(
                (item) => item !== id
            );
            setSelectedToolsAndAccessoriesIDs(newArray);
        } else {
            // Add the selected product if the limit is not reached
            setSelectedToolsAndAccessoriesIDs([
                ...selectedToolsAndAccessoriesIDs,
                id,
            ]);
        }
    };



    const handleRuleName = (e) => {
        setRuleName(e.target.value)
    }



    const ruleTypeOptions=[

        {label: "Product", value: "product"},
        {label: "Type", value: "type"},
        {label: "Vendor", value: "vendor"},
        {label: "Tags", value: "tags"},
    ];

    const handleRuleType = useCallback((value) => {
        setNewType('')
        setPendingType('')
        setRuleType(value)

    }, []);
    return (
        <Frame>
        <div className='Discount-Detail-Page'>


            <Modal
                open={toolsAndAccessoriesProductModal}
                size="fullScreen"
                onClose={handleCloseToolsAndAccessoriesModal}
                title="Add Products"
                primaryAction={{
                    content: "Add",
                    disabled: !selectedToolsAndAccessoriesIDs.length,
                    onAction: handleToolsAndAccessoriesSaveModal,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: handleCloseToolsAndAccessoriesModal,
                    },
                ]}
            >
                <Box
                    paddingBlockStart={"300"}
                    paddingBlockEnd={"300"}
                    paddingInlineStart={"400"}
                    paddingInlineEnd={"400"}
                >
                    <TextField
                        labelHidden
                        type="text"
                        placeholder="Search products"
                        value={textFieldValue}
                        prefix={<Icon source={SearchMajor} tone="base" />}
                        onChange={handleTextFieldChange}
                        autoComplete="off"
                    />
                </Box>
                <Divider borderWidth={1} />
                <div className="product-lists">
                    <Scrollable horizontal className="yr5fA CyBRb">
                        {productsLoading ? (
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Spinner size="large" />
                            </div>
                        ) : productsListFilter?.length ? (
                            productsListFilter?.map((product, i) => {
                                const isSelected =
                                    selectedToolsAndAccessoriesIDs?.includes(
                                        product.id
                                    );
                                return (
                                    <div className="product-list-item" key={i}>
                                        <Checkbox
                                            labelHidden
                                            checked={isSelected}
                                            onChange={() =>
                                                handleToolsAndAccessoriesSelect(
                                                    product.id
                                                )
                                            }
                                        />
                                        <div
                                            className="product-list-item-product-title"
                                            onClick={() =>
                                                handleToolsAndAccessoriesSelect(
                                                    product.id
                                                )
                                            }
                                        >
                                            <div className="product-list-item-product-title-inner">
                                                <div className="product-list-item-product-title-thumbnail">
                                                    <Thumbnail
                                                        source={
                                                            product?.image?.src
                                                        }
                                                        size="small"
                                                    />
                                                </div>
                                                <div className="product-list-item-product-title-text">
                                                    <div className="ExJYf">
                                                        <div className="K2zxu">
                                                            <span>
                                                                {product?.title}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div
                                style={{
                                    height: "100%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text as="h2" variant="headingMd">
                                    No Product Found
                                </Text>
                            </div>
                        )}
                    </Scrollable>
                </div>
            </Modal>
            <Modal
                open={discardModal}
                onClose={handleDiscardModal}
                title="Leave page with unsaved changes?"
                primaryAction={{
                    content: 'Leave page',
                    destructive: true,
                    onAction: discardAddSeller,
                }}
                secondaryActions={[
                    {
                        content: 'Stay',
                        onAction: handleDiscardModal,
                    },
                ]}
            >

                    <TextContainer>
                        <p>
                            Leaving this page will delete all unsaved changes.
                        </p>
                    </TextContainer>

            </Modal>

            {loading ?
                <span>
                    <Loading />
                    <SkeltonPageForProductDetail />
                </span>
                :
                <Page
                    backAction={{ content: "Home", url: "/" }}
                    breadcrumbs={[{ content: 'Discounts', onAction: handleDiscardModal }]}
                    title="Create Rule"


                >
                    {discountError ?
                        <Banner
                            title="There is 1 error with this discount:"
                            status="critical"
                        >
                            <List>
                                <List.Item>
                                    Specific {discountError} must be added
                                </List.Item>
                            </List>
                        </Banner> : ''
                    }

                    <Form >
                        <FormLayout>
                            <LegacyCard sectioned title='Rules'>
                                {skeleton ? <SkeletonBodyText/> :
                                    <>
                                        <div className="label_editor">
                                            <InputField

                                                label='Rule Name'
                                                type='text'
                                                marginTop
                                                required
                                                name='name'
                                                value={ruleName}
                                                onChange={handleRuleName}
                                                error={
                                                    titleError
                                                        ? "Rule Name is required"
                                                        : ""
                                                }

                                            />
                                        </div>

                                    </>
                                }
                            </LegacyCard>
                            <LegacyCard sectioned title='Rules Type'>
                                {skeleton ? <SkeletonBodyText/> :
                                    <>


                                        <div className="label_editor">
                                            <Select
                                                label="Rule Type"
                                                options={ruleTypeOptions}
                                                onChange={handleRuleType}
                                                value={ruleType}
                                            />
                                        </div>

                                    </>
                                }
                            </LegacyCard>


                            {ruleType == 'product' &&
                                <LegacyCard sectioned title="Products">
                                    {selectedToolsAndAccessories.map(
                                        (product, index) => (
                                            <div
                                                key={product.id}
                                                className="flex gap-3 !justify-between items-center flex-row border-b py-2"
                                            >
                                                <div>
                                                    <Thumbnail
                                                        source={
                                                            product?.image?.src
                                                        }
                                                        size="small"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex gap-3 justify-between items-center">
                                                        <div className="flex-1">
                                                            <Text
                                                                as="p"
                                                                fontWeight="regular"
                                                            >
                                                                {product.title}
                                                            </Text>
                                                        </div>
                                                        <Button
                                                            onClick={() =>
                                                                handleRemoveToolsAndAccessories(
                                                                    product?.id
                                                                )
                                                            }
                                                            icon={DeleteMinor}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    )}

                                    <div
                                        className={
                                            selectedToolsAndAccessories.length
                                                ? "py-2"
                                                : "p-0"
                                        }
                                    >
                                        <Button
                                            variant="plain"
                                            onClick={
                                                handleOpenToolsAndAccessoriesModal
                                            }
                                            icon={PlusMinor}
                                        >
                                            Add Products
                                        </Button>
                                    </div>
                                </LegacyCard>
                            }

                            {(ruleType == 'type' || ruleType == 'vendor' || ruleType == 'tags') &&
                                <LegacyCard sectioned title={ruleType == 'type'?'Type': ruleType == 'vendor'?'Vendor' : 'Tags'} >

                                    <div onKeyDown={handleKeyPress}>
                                        <TextField
                                            id="pendingTag"
                                            label={ruleType == 'type'?'Type': ruleType == 'vendor'?'Vendor' : 'Tags'}
                                            value={pendingType}
                                            onChange={handleChange}
                                            onBlur={handleBlur}

                                        />
                                    </div>
                                    <div className="tags_spacing">{trackingNumberToAddMarkup}</div>
                                </LegacyCard>
                            }

                        </FormLayout>
                    </Form>


                    <div className='Polaris-Product-Actions'>
                        <PageActions
                            primaryAction={{
                                content: 'Save',
                                onAction: handleSave,
                                loading: btnLoading
                            }}

                        />
                    </div>
                </Page >
            }
            {toastErrorMsg}
            {toastSuccessMsg}
        </div>
        </Frame>
    );


}
