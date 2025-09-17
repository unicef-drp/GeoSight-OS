import { useCallback, useState } from "react";

export function useDisclosure(defaultOpen: boolean = false) {
  const [open, setOpen] = useState(defaultOpen);

  const onOpen = useCallback(() => setOpen(true), []);
  const onClose = useCallback(() => setOpen(false), []);
  const onToggle = useCallback(() => setOpen((prev) => !prev), []);

  return { open, onOpen, onClose, onToggle };
}
