"use client";
import { BiLogoTypescript, BiLogoJavascript } from "react-icons/bi";
import { FileOutlined, FolderOpenOutlined, FolderOutlined } from "@ant-design/icons";

import "./styles.css";

interface FolderIconProps {
    isOpen: boolean
}

interface FileIconProps {
    filename: string
}

export const FolderIcon = ({ isOpen }: FolderIconProps) =>
    isOpen ? (
        <><FolderOpenOutlined /> </>
    ) : (
        <><FolderOutlined /> </>
    );

export const FileIcon = ({ filename }: FileIconProps) => {
    const extension = filename.slice(filename.lastIndexOf(".") + 1);
    switch (extension) {
        case "ts":
            return <><BiLogoTypescript fill="#36feff" /> </>
        case "js":
            return <><BiLogoJavascript fill="yellow" /> </>
        default:
            return <><FileOutlined /> </>
    }
};
