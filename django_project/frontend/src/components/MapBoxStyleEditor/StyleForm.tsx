import React, { useState } from "react";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  IconButton,
  Paper,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import type { LayerSpecification } from "maplibre-gl";
import { DeleteIcon } from "../Icons";
import { Circle } from "./Form/Circle";
import { Fill } from "./Form/Fill";
import { Line } from "./Form/Line";
import { Symbol } from "./Form/Symbol";
import { FieldAttribute } from "../../types/Field";
import { Filter } from "./Filter";

export const Render = ({
  layer,
  onUpdate,
}: {
  layer: LayerSpecification;
  onUpdate: (layer: LayerSpecification) => void;
}) => {
  switch (layer.type) {
    case "circle":
      return <Circle layer={layer} setLayer={onUpdate} />;
    case "fill":
      return <Fill layer={layer} setLayer={onUpdate} />;
    case "line":
      return <Line layer={layer} setLayer={onUpdate} />;
    case "symbol":
      return <Symbol layer={layer} setLayer={onUpdate} />;
    default:
      return <div>This type does not have editor</div>;
  }
};

function SortableAccordionItem({
  id,
  layer,
  fields,
  onUpdate,
  onDelete,
  expanded,
  setExpanded,
}: {
  id: string;
  layer: LayerSpecification;
  fields: FieldAttribute[];
  onUpdate: (layer: LayerSpecification) => void;
  onDelete: (layer: LayerSpecification) => void;
  expanded: string | null;
  setExpanded: (id: string | null) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 8px 20px rgba(0,0,0,0.12)" : undefined,
    zIndex: isDragging ? 9999 : undefined,
    mb: 1,
  } as React.CSSProperties;

  const isOpen = expanded === id;
  // @ts-ignore
  return (
    <Accordion
      expanded={isOpen}
      onChange={(_, isExpanded) => setExpanded(isExpanded ? id : null)}
      ref={setNodeRef}
      style={style}
      component={Paper}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{ display: "flex", alignItems: "center" }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div>{layer.id}</div>
          {/* @ts-ignore */}
          <IconButton
            size="small"
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onDelete(layer);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
        <IconButton
          className="dragIcon"
          aria-label="drag"
          {...attributes}
          {...listeners}
          sx={{ ml: 1 }}
        >
          <DragIndicatorIcon />
        </IconButton>
      </AccordionSummary>
      <AccordionDetails>
        <Filter
          layerType={layer.type}
          /* @ts-ignore */
          filter={layer.filter}
          setFilter={(filter) => {
            console.log(filter);
            const newLayer = { ...layer };
            /* @ts-ignore */
            newLayer.filter = filter;
            onUpdate(newLayer);
          }}
          fields={fields}
          onAdd={() => {
            const newLayer = { ...layer };
            /* @ts-ignore */
            newLayer.filter.push(["==", fields[0].name, "Value"]);
            onUpdate(newLayer);
          }}
        />
        <Render layer={layer} onUpdate={onUpdate} />
      </AccordionDetails>
    </Accordion>
  );
}

export default function StyleForm({
  layers,
  setLayers,
  fields,
}: {
  layers: LayerSpecification[];
  setLayers: (layers: LayerSpecification[]) => void;
  fields?: FieldAttribute[];
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart() {
    setExpanded(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = layers.findIndex((i) => i.id === active.id);
      const newIndex = layers.findIndex((i) => i.id === over.id);
      setLayers(arrayMove(layers, oldIndex, newIndex));
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToVerticalAxis]}
    >
      <SortableContext
        items={layers.map((i: LayerSpecification) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        {layers.map((layer: LayerSpecification, idx) => (
          <SortableAccordionItem
            key={layer.id}
            id={layer.id}
            layer={layer}
            fields={fields}
            expanded={expanded}
            setExpanded={setExpanded}
            onUpdate={(layer: LayerSpecification) => {
              const newLayers = [...layers];
              newLayers[idx] = { ...layer };
              setLayers(newLayers);
            }}
            onDelete={(layer: LayerSpecification) => {
              setLayers(layers.filter((l) => l.id !== layer.id));
            }}
          />
        ))}
      </SortableContext>
    </DndContext>
  );
}
