/**
 * GeoSight is UNICEF's geospatial web-based business intelligence platform.
 *
 * Contact : geosight-no-reply@unicef.org
 *
 * .. note:: This program is free software; you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation; either version 3 of the License, or
 *     (at your option) any later version.
 *
 * __author__ = 'irwan@kartoza.com'
 * __date__ = '16/01/2025'
 * __copyright__ = ('Copyright 2023, Unicef')
 */
import React, {
  Fragment,
  memo,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import {
  FilterGroupDataProps,
  FilterGroupElementProps,
  OPTIONS_TYPES,
  TYPE
} from "./types.d";
import Checkbox from "@mui/material/Checkbox";
import { SelectPlaceholder } from "../../Input";
import DeleteFilter from "./FilterDelete";
import FilterInput from "./FilterInput";

/** Filter group component */
const FilterGroupElement = memo(
  ({
     // Operator stats
     operator,
     setOperator,

     // Active state
     active,
     setActive,

     // On delete
     onDelete,

     // Is master
     isMaster
   }: FilterGroupElementProps) => {
    console.log('FilterGroupElement ' + operator)

    // Fetch this from global data
    const ableToModify = true

    const [
      result, setResult
    ] = useState<string[]>(null);

    /** Render **/
    return (
      <div className='FilterGroupHeader'>
        <div className='FilterGroupOption'>
          <Checkbox
            className='GroupSwitcher'
            // @ts-ignore
            checked={active == true}
            size="small"
            onChange={() => {
              setActive(!active)
            }}
          />
          {
            ableToModify ?
              <Fragment>
                <SelectPlaceholder
                  placeholder='Operator'
                  list={OPTIONS_TYPES}
                  initValue={operator}
                  onChangeFn={(value: string) => {
                    setOperator(value)
                  }}
                />
              </Fragment> :
              <div className='OperatorIdentifier'>{operator}</div>
          }
          <div className='Separator'/>
          {
            !isMaster && <DeleteFilter
              text={'Are you sure want to delete this group?'}
              onDelete={onDelete}
            />
          }
        </div>
      </div>
    )
  }
)

/** Filter group component */
const FilterGroup = (
  {
    /* Global query */
    query,
    updateQuery,

    /* Is master */
    isMaster,

    /* Event on delete */
    onDelete
  }: FilterGroupDataProps
) => {
  console.log('FilterGroup')
  const active = query.active;
  const prevActiveRef = useRef<boolean | undefined>();

  /** When active changed **/
  useEffect(() => {
    if (prevActiveRef.current !== undefined && prevActiveRef.current !== active) {
      let updated = true
      query.queries.map((query: any) => {
        if (query.active !== active) {
          query.active = active
        } else {
          updated = false
        }
      })
      if (updated) {
        updateQuery();
      }
    }
    prevActiveRef.current = active == true;
  }, [active]);

  // Operator callbacks
  const setOperator = useCallback((value: string) => {
    if (query.operator !== value) {
      query.operator = value
      updateQuery()
    }
  }, []);

  // Active callbacks
  const setActive = useCallback((value: boolean) => {
    if (query.active !== value) {
      query.active = value
      updateQuery()
    }
  }, []);

  // Active callbacks
  const onDeleteCallback = useCallback(() => {
    if (!isMaster) {
      onDelete()
    }
  }, []);


  // RENDER
  return <div className='FilterGroup'>
    <FilterGroupElement
      /* operator */
      operator={query.operator}
      setOperator={setOperator}

      /* active */
      active={active}
      setActive={setActive}

      /* Is master */
      isMaster={isMaster}

      /* Event on delete */
      onDelete={onDeleteCallback}
    />
    {
      query.queries?.length > 0 ?
        query.queries?.map(
          (row: any, idx: any) => (
            row.type === TYPE.GROUP ?
              <FilterGroup
                key={idx}

                /* Global query */
                query={row}
                updateQuery={updateQuery}

                /* On delete */
                onDelete={() => {
                  query.queries = query.queries.filter(
                    (query: any, _idx: number) => _idx !== idx
                  )
                  updateQuery()
                }}
              /> : <FilterInput
                query={row}
                updateQuery={updateQuery}
                onDelete={() => {
                  query.queries = query.queries.filter(
                    (query: any, _idx: number) => _idx !== idx
                  )
                  updateQuery()
                }}/>

          )
        )
        : <div className='FilterNote'>There is no filter for this group.</div>
    }
  </div>
};

export default FilterGroup;