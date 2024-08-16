import {
  Card,
  Page,
  Layout,
  TextContainer,
  Image,
  BlockStack,
    Frame,
    Modal,
    useIndexResourceState,
    ButtonGroup,
    Icon,
    Toast,
    Tabs,
    TextField,
    EmptySearchResult,
    LegacyCard,
    IndexFilters,
    useSetIndexFiltersMode,
    Pagination,
    Loading,
    Badge,
    Button,
    IndexTable,
  Link,
  Text,
} from "@shopify/polaris";

import {TitleBar, useAppBridge} from "@shopify/app-bridge-react";
import SkeletonTable from "../components/SkeletonTable.jsx";
import {
    EditMinor,
    DeleteMinor,

} from "@shopify/polaris-icons";
import { useTranslation, Trans } from "react-i18next";
import React, { useState, useCallback, useEffect, useContext } from "react";
import { trophyImage } from "../assets";

import {AppContext, ProductsCard} from "../components";
import {useNavigate} from "react-router-dom";
import {getSessionToken} from "@shopify/app-bridge-utils";
import axios from "axios";

export default function HomePage() {
  const { t } = useTranslation();
    const appBridge = useAppBridge();
    const { apiUrl } = useContext(AppContext);
    const [modalReassign, setModalReassign] = useState(false);
    const [loading, setLoading] = useState(true);
    const [btnLoading, setBtnLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const queryParams = new URLSearchParams(location.search);
    const [paginationValue, setPaginationValue] = useState(1);
    const currentPage = parseInt(queryParams.get('page')) || 1;
    const search_value = (queryParams.get('search')) || "";
    const [queryValue, setQueryValue] = useState(search_value);
    const [showClearButton, setShowClearButton] = useState(false);
    const [customersLoading, setCustomersLoading] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPreviousPage, setHasPreviousPage] = useState(false);
    const [activeDeleteModal, setActiveDeleteModal] = useState(false);
    const [deleteBtnLoading, setDeleteBtnLoading] = useState(false);
    const [toggleLoadData, setToggleLoadData] = useState(true);
    const [rules, setRules] = useState([]);
    const { mode, setMode } = useSetIndexFiltersMode();
    const [toastMsg, setToastMsg] = useState('')
    const [ruleID, setRuleID] = useState("");
    const toggleDeleteModalClose = useCallback(() => {
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);
    const onHandleCancel = () => {};
    const navigate = useNavigate();

    // const [rules, setRules] = useState([]);
    const { selectedResources, allResourcesSelected, handleSelectionChange } =
        useIndexResourceState(rules);


    const allResourcesSelect = rules?.every(({ id }) =>
        selectedResources.includes(id)
    );
    const toggleDeleteModal = useCallback((id) => {
        setRuleID(id);
        setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
    }, []);
    const fetchData = async () => {
        try {
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.get(
                `${apiUrl}rules?status=${
                    selected == 0 ? "all" : selected == 1 ? 1 : 0
                }&search=${queryValue}&page=${paginationValue}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            if (response?.status === 200) {
                setRules(response?.data?.data);
                setLoading(false);
                setToggleLoadData(false);
                setHasNextPage(response?.data?.last_page > paginationValue);
                setHasPreviousPage(paginationValue > 1);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePagination = (value) => {
        if (value == "next") {
            setPaginationValue(paginationValue + 1);
        } else {
            setPaginationValue(paginationValue - 1);
        }
        setLoading(true);
        setToggleLoadData(true);
    };

    const handleDelete = async () => {
        setDeleteBtnLoading(true);
        try {
            let sessionToken = await getSessionToken(appBridge);
            const response = await axios.delete(
                `${apiUrl}delete-rule/${ruleID}`,
                {
                    headers: {
                        Authorization: `Bearer ${sessionToken}`,
                    },
                }
            );
            if (response?.status === 200) {
                setSucessToast(true);
                setToastMsg(response?.data?.message);
                setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
                setToggleLoadData(true);
                setDeleteBtnLoading(false);
            } else {
                setErrorToast(true);
                setToastMsg(response?.data?.message);
                setDeleteBtnLoading(false);
            }
        } catch (error) {
            setDeleteBtnLoading(false);
            setActiveDeleteModal((activeDeleteModal) => !activeDeleteModal);
        }
    };

    useEffect(() => {
        if (toggleLoadData) {
            fetchData();
        }
    }, [toggleLoadData, selected, queryValue]);
    const emptyStateMarkup = (
        <EmptySearchResult title={"No Rule Found"} withIllustration />
    );
    function handleRowClick(id) {
        const target = event.target;
        const isCheckbox = target.tagName === "INPUT" && target.type === "checkbox";

        if (!isCheckbox) {
            event.stopPropagation(); // Prevent row from being selected
        } else {
            // Toggle selection state of row
            const index = selectedResources.indexOf(id);
            if (index === -1) {
                handleSelectionChange([...selectedResources, id]);
            } else {
                handleSelectionChange(selectedResources.filter((item) => item !== id));
            }
        }
    }

    const formatDate = (created_at) => {
        const months = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ];

        const date = new Date(created_at);
        const monthName = months[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();

        const formattedDate = `${monthName} ${day}, ${year}`;
        return formattedDate;
    }


    const resourceName = {
        singular: "Rule",
        plural: "Rules",
    };
    const [errorToast, setErrorToast] = useState(false);
    const [sucessToast, setSucessToast] = useState(false);
    const handleReassignCloseAction = () => {
        setUniqueId();
        setSellerEmail("");
        setModalReassign(false);
    };

    const handleFiltersQueryChange = useCallback((value) => {
        setQueryValue(value);
        setToggleLoadData(true);
    }, []);



    // ------------------------Toasts Code start here------------------
    const toggleErrorMsgActive = useCallback(() => setErrorToast((errorToast) => !errorToast), []);
    const toggleSuccessMsgActive = useCallback(() => setSucessToast((sucessToast) => !sucessToast), []);


    const toastErrorMsg = errorToast ? (
        <Toast content={toastMsg} error onDismiss={toggleErrorMsgActive} />
    ) : null;

    const toastSuccessMsg = sucessToast ? (
        <Toast content={toastMsg} onDismiss={toggleSuccessMsgActive} />
    ) : null;


    const handleCreateRule = async () => {

        navigate('/CreateRule')

    };

    const [itemStrings, setItemStrings] = useState([
        "All",
        "Active",
        "Inactive",
    ]);

    const tabs = itemStrings.map((item, index) => ({
        content: item,
        index,
        onAction: () => {},
        id: `${item}-${index}`,
        isLocked: index === 0,

    }));

    const handleOrderFilter =async (value) =>  {
        setSelected(value)
        setLoading(true)
        const sessionToken = await getSessionToken(appBridge);

    }



    const rowMarkup = rules?.map(
        (
            {
                id,
                name,
                created_at,
                type,
                status,



            },
            index
        ) => (
            <IndexTable.Row
                id={id}
                key={id}
                selected={selectedResources.includes(id)}
                position={index}
                onClick={() => handleRowClick(id)} // Add this line
            >


                <IndexTable.Cell>
                    <Text variant="bodyMd" fontWeight="semibold" as="span">
                        {name != null ? name : "---"}
                    </Text>
                </IndexTable.Cell>

                <IndexTable.Cell>
                    <div className="capitalize">
                        <Badge tone="warning" >{type}</Badge>
                    </div>
                </IndexTable.Cell>
                <IndexTable.Cell>{created_at != null ? formatDate(created_at) : "---"}</IndexTable.Cell>

                <IndexTable.Cell>
                    {status === 1 ? (
                        <Badge tone="success">Active</Badge>
                    ) : (
                        <Badge tone="info">Inactive</Badge>
                    )}
                </IndexTable.Cell>



                <IndexTable.Cell>
                    <ButtonGroup>
                        <Button
                            size="large"
                            icon={EditMinor}
                            onClick={() => navigate(`/rules/${id}`)}
                        />
                        <Button
                            size="large"
                            icon={DeleteMinor}
                            onClick={() => toggleDeleteModal(id)}
                        />
                    </ButtonGroup>
                </IndexTable.Cell>


            </IndexTable.Row>
        )
    );
    return (
        <>
            <Modal
                open={activeDeleteModal}
                onClose={toggleDeleteModalClose}
                title="Delete Rule"
                primaryAction={{
                    destructive: true,
                    content: "Delete",
                    loading: deleteBtnLoading,
                    onAction: handleDelete,
                }}
                secondaryActions={[
                    {
                        content: "Cancel",
                        onAction: toggleDeleteModalClose,
                    },
                ]}
            >
                <Modal.Section>
                    <p>This can't be undone.</p>
                </Modal.Section>
            </Modal>
            {loading ? (
                <SkeletonTable />
            ) : (
                <Page
                    title="Rules"
                    primaryAction={
                        <Link url="/rules/CreateRule">
                            <Button variant="primary">Create Rule</Button>
                        </Link>
                    }

                >
                    <Layout>
                        <Layout.Section>
                            <LegacyCard>
                                <IndexFilters
                                    loading={toggleLoadData}
                                    queryValue={queryValue}
                                    queryPlaceholder="Searching in all"
                                    onQueryChange={handleFiltersQueryChange}
                                    onQueryClear={() => {
                                        setQueryValue("");
                                        setToggleLoadData(true);
                                    }}
                                    cancelAction={{
                                        onAction: onHandleCancel,
                                        disabled: false,
                                        loading: false,
                                    }}
                                    tabs={tabs}
                                    selected={selected}
                                    onSelect={(selected) => {
                                        setSelected(selected);
                                        setToggleLoadData(true);
                                    }}
                                    canCreateNewView={false}
                                    hideFilters
                                    mode={mode}
                                    setMode={setMode}
                                    filteringAccessibilityTooltip="Search"
                                />
                                <IndexTable
                                    resourceName={resourceName}
                                    itemCount={rules?.length}
                                    selectable={false}
                                    pagination={{
                                        hasPrevious: hasPreviousPage
                                            ? true
                                            : false,
                                        onPrevious: () =>
                                            handlePagination("prev"),
                                        hasNext: hasNextPage ? true : false,
                                        onNext: () => handlePagination("next"),
                                    }}
                                    headings={[
                                        { title: "Name" },
                                        { title: "Type" },
                                        { title: "Date" },
                                        { title: "Status" },
                                        { title: "Actions" },
                                    ]}
                                >
                                    {rowMarkup}
                                </IndexTable>
                            </LegacyCard>
                        </Layout.Section>
                        <Layout.Section></Layout.Section>
                        <Layout.Section></Layout.Section>
                    </Layout>

                    {toastErrorMsg}
                    {toastSuccessMsg}
                </Page>
            )}
        </>
    );
}
