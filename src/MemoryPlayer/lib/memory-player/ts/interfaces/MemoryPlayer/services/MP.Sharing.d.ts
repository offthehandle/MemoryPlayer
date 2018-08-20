
interface IMemoryPlayerSharing {
    isTimeUsed: boolean;
    sharelink: string;
    sharelinkTime: string;
    cancelTimer(): void;
    share(): void;
    updateTime(): void;
    useTime(): void;
}
