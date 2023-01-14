import { ITerminalAddon, Terminal } from 'xterm';
import { ISearchOptions, SearchAddon } from 'xterm-addon-search';
import './index.css';
export interface SearchBarOption extends ISearchOptions {
    searchAddon: SearchAddon;
}
export declare class SearchBarAddon implements ITerminalAddon {
    private readonly options;
    private terminal;
    private readonly searchAddon;
    private searchBarElement;
    private searchKey;
    constructor(options: Partial<SearchBarOption>);
    activate(terminal: Terminal): void;
    dispose(): void;
    /**
     *  Show the bar in the term
     * @returns empty
     * @memberof SearchBarAddon  necessary search addon instance
     */
    show(): void;
    /**
     * You can manually call close, also can click the close button on the bar
     * @memberof SearchBarAddon
     */
    hidden(): void;
    private on;
    /**
     * You can customize your own style, and then add CSS string template after search bar init
     * @param {string} newStyle
     * @memberof SearchBarAddon
     */
    addNewStyle(newStyle: string): void;
}
