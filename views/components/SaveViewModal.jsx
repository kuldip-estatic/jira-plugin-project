import React, { useEffect, useState } from "react";

import Button from "@atlaskit/button/standard-button";

import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from "@atlaskit/modal-dialog";
import TextField from "@atlaskit/textfield";
import { Field } from "@atlaskit/form";

const SaveViewModal = ({
  isOpen,
  setIsOpen,
  AP,
  selectedColumns,
  selectedStatusColumnList,
  getFilterList,
}) => {
  const closeModal = () => setIsOpen(false);
  const [apiCall, setApiCall] = useState(1);
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newData = {};
    for (const [key, value] of formData) {
      newData[key] = value;
    }

    let jql = "";
    if (selectedStatusColumnList.length) {
      let statusColList = [...new Set(selectedStatusColumnList)];
      jql = "status in (";
      statusColList.forEach((item) => {
        jql += item.trim().indexOf(" ") > 0 ? `"${item}",` : `${item},`;
      });
      jql = jql.slice(0, -1);
      jql += ")";
    }

    newData["jql"] = jql;
    AP.request({
      url: "/rest/api/3/filter",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(newData),
      success: function (responseText) {
        let responseValue = JSON.parse(responseText);
        getFilterList();
        setIsOpen(false);
      },
      error: function (xhr, statusText, errorThrown) {
        console.log("xhr", xhr);
      },
    });

    // console.log("selectedColums", selectedColumns);
    let selectedColumnObject = { columns: [] };
    selectedColumns.forEach((item) =>
      selectedColumnObject.columns.push(item.value)
    );

    let formData1 = new FormData();
    formData1.append("columns", selectedColumnObject);
    let dataVal = JSON.stringify(selectedColumnObject);
    AP.request({
      url: `/rest/api/3/filter/10057/columns`,
      type: "PUT",
      contentType: "application/json",
      // data: JSON.stringify(formData1),
      accept: "accept: application/json",
      //contentType: "*/*",
      data: dataVal,
      success: (response) => {
        setApiCall((prevState) => prevState + 1);
      },
      error: (error) => {
        console.log("error", error);
      },
    });
  };

  useEffect(() => {
    if (apiCall) {
      AP.request("/rest/api/3/filter/10057/columns")
        .then((data) => {
          console.log("data value", data);
        })
        .catch((error) => {
          console.log("error", error);
        });
    }
  }, [apiCall]);

  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <ModalHeader>
              <ModalTitle>Save Filter</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <Field
                aria-required={true}
                name="name"
                defaultValue=""
                label="Filter Name"
                isRequired
              >
                {({ fieldProps }) => (
                  <TextField {...fieldProps} value={undefined} />
                )}
              </Field>
              <Field
                aria-required={true}
                name="description"
                defaultValue=""
                label="Filter Description"
                isRequired
              >
                {({ fieldProps }) => (
                  <TextField {...fieldProps} value={undefined} />
                )}
              </Field>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" type="submit" autoFocus>
                Submit
              </Button>
              <Button appearance="link" onClick={closeModal}>
                Cancel
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </ModalTransition>
  );
};

export default SaveViewModal;
