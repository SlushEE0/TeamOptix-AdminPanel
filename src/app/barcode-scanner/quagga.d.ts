declare module 'quagga' {
  const Quagga: {
    init: (config: object, callback: (err: any) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (data: any) => void) => void;
  };

  export default Quagga;
}
