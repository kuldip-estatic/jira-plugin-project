import React, { useEffect, useState } from "react";
import DynamicTable from "@atlaskit/dynamic-table";
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
    td {
      font-size: 15px;
      width: 200px;
      max-width: 200px;
      min-width: 200px;
      word-break: break-all;
      white-space: nowrap;
      overflow: hidden !important;
      text-overflow: ellipsis;
      padding: 10px;
    }
    th {
      font-size: 15px;
      width: 200px;
      max-width: 200px;
      min-width: 200px;
      word-break: break-all;
      white-space: nowrap;
      overflow: hidden !important;
      text-overflow: ellipsis;
      padding: 10px;
    }
    tbody {
      display: block;
      height: 218px;
      overflow: auto;
    }
    thead,
    tbody tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    tr:nth-child(even) {
      background: #f6f6f6;
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
  const [pageNumber, setPageNumber] = useState(1);
  const [status, setStatus] = useState([]);
  const [selectedStatusColumns, setSelectedStatusColumns] = useState([]);
  const [head, setHead] = useState({ cells: [] });
  const [rows, setRows] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const caption = "List Of Issues";

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

  useEffect(() => {
    if (!issues.length) return;
    const rowKeys = issues.length ? ["id", "key", ...Object.keys(names)] : [];
    if (selectedStatusColumns.length) {
      const filteredRows = selectedStatusColumns
        .filter((selectedRow) => Object.keys(selectedRow).length > 1)
        .map((row) => ({
          cells: rowKeys
            .filter((rowKey) =>
              selectedColumns
                .map((selectedColumn) => selectedColumn.value)
                .includes(rowKey)
            )
            .map((field) => ({ content: rowsData(row, field) })),
        }));
      setRows(filteredRows);
    } else {
      const allRows = issues.map((row) => ({
        cells: rowKeys
          .filter((rowKey) =>
            selectedColumns
              .map((selectedColumn) => selectedColumn.value)
              .includes(rowKey)
          )
          .map((field) => {
            return {
              content: rowsData(row, field),
            };
          }),
      }));
      setRows(allRows);
    }
  }, [issues, selectedColumns, selectedStatusColumns]);

  useEffect(() => {
    if (!issues.length) return;
    issues.map(() => {
      let tableHeader = [];
      tableHeader = listUnion(columns, selectedColumns, "value").map(
        (title) => {
          return {
            content: title.text,
            key: title.value,
            isSortable: true,
          };
        }
      );
      const headObject = { cells: tableHeader };
      setHead(headObject);
    });
  }, [columns, selectedColumns]);

  const getPropByString = (obj, propString) => {
    if (!propString) return obj;
    let props = propString.split(".");
    let i = 0;
    for (let iLen = props.length - 1; i < iLen; i++) {
      let prop = props[i];

      let value = obj[prop];
      if (value !== undefined) {
        obj = value;
      } else {
        break;
      }
    }
    return obj[props[i]];
  };

  const rowsData = (data, field) => {
    if (
      !selectedColumns
        .map((selectedColumn) => selectedColumn.value)
        .includes(field)
    )
      return null;

    const detailProps = {
      assignee: "assignee.displayName",
      project: "project.name",
      watches: "watches.isWatching",
      priority: "priority.name",
      customfield_10018: "customfield_10018.showField",
      status: "status.name",
      creator: "creator.displayName",
      reporter: "reporter.displayName",
      aggregateprogress: "aggregateprogress.progress",
      progress: "progress.progress",
      votes: "votes.hasVoted",
    };

    const detailPropNames = Object.keys(detailProps);
    let rowData =
      typeof data[field] === "object" && data[field] !== null
        ? detailPropNames.includes(field)
          ? getPropByString(data, detailProps[field])
          : data[field].name
        : data[field];
    return rowData;
  };

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
    setPageNumber(1);
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
    // AP.request({
    //   url: `/rest/api/3/filter/${+item.id}/columns`,
    //   type: "GET",
    //   success: (response) => {
    //     console.log("response", response);
    //     debugger;
    //   },
    //   error: (error) => {
    //     console.log("error", error);
    //     debugger;
    //   },
    // });
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
            <Button appearance="subtle" onClick={() => setIsOpen(true)}>
              Save As
            </Button>,
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
          ]}
        />
      </div>
      <SaveViewModal {...saveViewModalProps} />
      <div className="dataMain">
        <div>
          {selectedColumns.map((item) => (
            <>{JSON.stringify(item.text)}</>
          ))}
        </div>
        <div>
          {selectedStatusColumns.map((item) => (
            <>{JSON.stringify(item.status.name)}</>
          ))}
        </div>
      </div>
    </div>
  );
};

export default customJira;
