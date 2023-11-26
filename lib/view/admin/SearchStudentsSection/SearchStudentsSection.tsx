import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "./SearchStudentsSection.module.css";

import IPersonDto from "@application/models/IPersonDto";
import AnimatedPanel from "@view/common/AnimatedPanel";
import EmploymentInfoDetail from "@view/admin/InfoDetails/EmploymentInfoDetail";
import useFetchPersons from "../Api/useFetchPersons";
import Table, { ITableCellIndex, ITableColumn } from "@view/common/Table";
import ISearchStudentsRow from "./ISearchStudentsRow";
import { personToRow } from "./SearchStudentsHelpers";
import Input from "@view/common/Fields/Input";
import Button from "@view/common/Button";


const SearchStudentsSection = () => {
  const [searchString, setSearchString] = useState<string>("");
  const { persons, loadingPersons } = useFetchPersons({
    searchString: searchString
  });
  const [selectedPerson, setSelectedPerson] = useState<undefined | IPersonDto>();
  const [selectedCell, setSelectedCell] = useState<undefined | ITableCellIndex<ISearchStudentsRow>>();
  const [openLeftPanel, setOpenLeftPanel] = useState(false);
  const searchInputRef = useRef<HTMLTextAreaElement & HTMLInputElement>(null);

  const [columns, setColumns] = useState<ITableColumn<ISearchStudentsRow>[]>([
    { Header: "#", accessor: "rowIndex", width: 50, cellWidth: 50, resizeDisabled: true },
    { Header: "Fecha de Registro", accessor: "registerDate", width: 200, cellWidth: 200 },
    { Header: "Nombres y apellidos", accessor: "fullName", width: 250, cellWidth: 250 },
  ]);

  const values = useMemo(() => persons
    ?.sort((a, b) => {
      const aCreatedAt = new Date(a.createdAt);
      const bCreatedAt = new Date(b.createdAt);
      if (aCreatedAt > bCreatedAt) return -1;
      if (aCreatedAt < bCreatedAt) return 1;
      return 0;
    })
    .map((x, index) => personToRow(x, index)) ?? [],
    [persons]
  );

  const onCellClick = (cellIndex: ITableCellIndex<ISearchStudentsRow>) => {
    setSelectedCell(selectedCell);
    setSelectedPerson(persons?.find(x => x.id === cellIndex.rowId));
    setOpenLeftPanel(true);
  };

  const onSubmit = (evt: FormEvent) => {
    evt.preventDefault();
    if (searchInputRef.current?.value != null) {
      setSearchString(searchInputRef.current?.value)
    }
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1>Buscar estudiantes por perfil de empleabilidad: </h1>
        <div className={styles.headersButtons}>

        </div>
      </header>
      <form className={styles.searchBox} onSubmit={onSubmit}>
        <Input variant="filled" placeholder="Palabras clave" ref={searchInputRef} onChange={(e) => { e.target.value == "" && setSearchString('')}} />
        <Button variant="contained" color="secondary" type="submit">
          Buscar
        </Button>
      </form>
      <main>
        <Table
          loading={loadingPersons}
          className={styles.table}
          columns={columns}
          values={values}
          onCellClick={onCellClick}
          selectedCell={selectedCell}
          onColumnsChange={setColumns}
        />
      </main>
      <AnimatedPanel open={openLeftPanel} onClose={() => { setOpenLeftPanel(false); }}>
        {selectedPerson
          ? (
            <div style={{ padding: "1rem 1rem" }} >
              <h1 style={{ color: "var(--color-primary)", textAlign: "center" }}>
                Perfil de empleabilidad
              </h1>
              {selectedPerson?.employmentInfo != null &&
                <EmploymentInfoDetail employmentInfo={selectedPerson.employmentInfo} />
              }
            </div>
          ) : (
            <></>
          )}
      </AnimatedPanel>
    </div>
  );
};

export default SearchStudentsSection;
