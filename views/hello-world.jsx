import React, { useEffect, useState } from "react";
import { AtlassianNavigation } from "@atlaskit/atlassian-navigation";
import DropdownMenu, {
  DropdownItemCheckbox,
  DropdownItemCheckboxGroup,
  DropdownItemGroup,
  DropdownItem,
} from "@atlaskit/dropdown-menu";
import Button from "@atlaskit/button";
import _ from "lodash";
import styled from "styled-components";
import { listUnion, jsonTryParse } from "../views/components/utils";
import SaveViewModal from "./components/SaveViewModal";

const Wrapper = styled.div`
  div {
    width: 100%;
    overflow-x: auto;
    caption {
      margin-bottom: 20px;
    }
  }
`;

const defaultColList = [
  { text: "Id", value: "id" },
  { text: "Key", value: "key" },
  { text: "Project", value: "project" },
  { text: "Summary", value: "summary" },
  { text: "Assignee", value: "assignee" },
  { text: "Status", value: "status" },
];

const customJira = (props) => {
  const { data, names, statusDetail, AP } = props;

  const defaultColumns = ["Id", "Key", ...Object.values(names)].map((title) => {
    return {
      text: title,
      value: title,
    };
  });

  const [columns, setColumns] = useState(defaultColumns);
  const [filterList, setFilterList] = useState([]);
  const [issues, setIssue] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [status, setStatus] = useState([]);
  const [selectedStatusColumns, setSelectedStatusColumns] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const getFilterList = () =>
    AP.request("/rest/api/3/filter/my?includeFavourites=true")
      .then((data) => {
        setFilterList(JSON.parse(data.body));
      })
      .catch((error) => console.log("error value", error));

  useEffect(() => {
    getFilterList();
    let columnList = Object.fromEntries(
      Object.entries(names).map(([a, b]) => [b, a])
    );
    columnList["Id"] = "id";
    columnList["Key"] = "key";
    let currentColumns = [...columns];
    currentColumns = currentColumns.map((column) => ({
      ...column,
      value: columnList[column.text],
    }));
    setColumns(currentColumns);
  }, []);

  useEffect(() => {
    const defaultSelectedColumns =
      jsonTryParse(localStorage.getItem("currentSelectedColumns")) ??
      defaultColList;
    const defauluSelectedStatusColumns =
      jsonTryParse(localStorage.getItem("currentStatusSelected")) ?? [];
    setSelectedColumns(
      defaultSelectedColumns?.length ? defaultSelectedColumns : defaultColList
    );

    setSelectedStatusColumns(defauluSelectedStatusColumns);
  }, []);

  useEffect(() => {
    const issueList = data.map((item) => {
      var listModel = {
        id: item.id,
        key: item.key,
      };
      var allFields = Object.keys(item.fields);
      allFields.forEach((field) => {
        var value = item.fields[field];
        listModel[field] = value;
      });
      return listModel;
    });
    setIssue(issueList);
  }, []);

  useEffect(() => {
    const statusNameSet = new Set();
    statusNameSet.add("To Do");
    statusNameSet.add("In Progress");
    statusNameSet.add("Done");
    statusDetail.forEach((item) => {
      statusNameSet.add(item.name);
    });
    const statusList = [...statusNameSet].map((item) => ({ name: item }));
    setStatus(statusList);
  }, []);

  const handleSelection = (currentColumn) => {
    let currentSelectedColumns = [...selectedColumns];
    if (
      currentSelectedColumns
        .map((currentSelectedColumn) => currentSelectedColumn.value)
        .includes(currentColumn.value)
    ) {
      if (currentSelectedColumns.length === 1) {
        alert("You need to have at least one column selected");
        return;
      }
      currentSelectedColumns = currentSelectedColumns.filter(
        (currentSelectedColumn) =>
          currentSelectedColumn.value !== currentColumn.value
      );
    } else {
      currentSelectedColumns.push(currentColumn);
    }
    setSelectedColumns([...currentSelectedColumns]);
  };

  const handleStatusSelection = (currentStatus) => {
    let currentStatusSelected = [...selectedStatusColumns];
    if (
      currentStatusSelected
        .map((item) => item.status.name)
        .includes(currentStatus.name)
    ) {
      currentStatusSelected = currentStatusSelected.filter(
        (currentSelectedStatus) =>
          currentSelectedStatus.status.name !== currentStatus.name
      );
    } else {
      const res = issues.filter((rows) => {
        return rows.status.name === currentStatus.name;
      });
      if (res.length) currentStatusSelected.push(...res);
      else currentStatusSelected.push({ status: { name: currentStatus.name } });
    }
    setSelectedStatusColumns([...currentStatusSelected]);
  };

  useEffect(
    () =>
      localStorage.setItem(
        "currentStatusSelected",
        JSON.stringify(selectedStatusColumns)
      ),
    [selectedStatusColumns]
  );

  useEffect(
    () =>
      localStorage.setItem(
        "currentSelectedColumns",
        JSON.stringify(selectedColumns)
      ),
    [selectedColumns]
  );

  const selectedStatusColumnList = selectedStatusColumns.map(
    (selectedStatus) => selectedStatus.status.name
  );

  const saveViewModalProps = {
    selectedColumns,
    selectedStatusColumnList,
    AP,
    isOpen,
    setIsOpen,
    getFilterList,
  };

  const handleFilter = (item) => {
    let data = JSON.stringify({
      queries: [`${item.jql}`],
    });
    if (item.jql.length) {
      AP.request({
        url: "/rest/api/3/jql/parse",
        type: "POST",
        data,
        contentType: "application/json",
        success: (response) => {
          const resToObject = JSON.parse(response);
          let statusObject;
          if (resToObject.queries[0].structure.where?.clauses) {
            [statusObject] =
              resToObject.queries[0].structure.where?.clauses.filter(
                (item) => item.field.name === "status"
              );
          } else if (
            resToObject.queries[0].structure.where.field.name === "status"
          ) {
            statusObject = resToObject.queries[0].structure.where;
          } else {
            statusObject = {};
          }
          if (!_.isEmpty(statusObject)) {
            let statusList = statusObject.operand.values.map(
              ({ value }) => value
            );
            setSelectedStatusColumns(
              issues.filter((item) => statusList.includes(item.status.name))
            );
          }
        },
        error: (error) => {
          console.log("error", error);
        },
      });
    } else if (item.jql === "") setSelectedStatusColumns([...issues]);
  };

  return (
    <div className="mainContainer">
      <div className="mainNavigation">
        <AtlassianNavigation
          label="site"
          renderProductHome={() => null}
          primaryItems={[
            <DropdownMenu className="test12" trigger="Columns">
              <DropdownItemGroup className="dropdownmenu">
                <DropdownItemCheckboxGroup title="Categories" id="actions">
                  {!!issues.length &&
                    columns.map((column) => (
                      <DropdownItemCheckbox
                        id={column.value}
                        key={column.value}
                        isSelected={selectedColumns
                          .map((selectedColumn) => selectedColumn.value)
                          .includes(column.value)}
                        onClick={() => handleSelection(column)}
                      >
                        {column.text}
                      </DropdownItemCheckbox>
                    ))}
                </DropdownItemCheckboxGroup>
              </DropdownItemGroup>
            </DropdownMenu>,
            <DropdownMenu trigger="Status">
              <DropdownItemGroup className="dropdownmenu">
                <DropdownItemCheckboxGroup id="actions">
                  {!!status.length &&
                    status.map((item) => (
                      <DropdownItemCheckbox
                        id={item}
                        key={item.name}
                        isSelected={selectedStatusColumnList.includes(
                          item.name
                        )}
                        onClick={() => handleStatusSelection(item)}
                      >
                        {item.name}
                      </DropdownItemCheckbox>
                    ))}
                </DropdownItemCheckboxGroup>
              </DropdownItemGroup>
            </DropdownMenu>,

            <DropdownMenu
              className="test12"
              trigger="Filters"
              placement="bottom"
            >
              <DropdownItemGroup className="dropdownmenu">
                {!!filterList.length &&
                  filterList.map((item) => (
                    <DropdownItem
                      key={item.id}
                      onClick={() => handleFilter(item)}
                    >
                      {item.name}
                    </DropdownItem>
                  ))}
              </DropdownItemGroup>
            </DropdownMenu>,
            <Button appearance="primary" onClick={() => setIsOpen(true)}>
              Save As
            </Button>,
          ]}
        />
      </div>

      <SaveViewModal {...saveViewModalProps} />
      <div className="dataMain">
        <div>
          Selected Columns: [
          {selectedColumns.map((item) => (
            <>{JSON.stringify(item.text)}</>
          ))}
          ]
        </div>
        <div>
          selected status: [
          {selectedStatusColumns.map((item) => (
            <>{JSON.stringify(item.status.name)}</>
          ))}
          ]
        </div>
      </div>
    </div>
  );
};

export default customJira;
